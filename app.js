const request = require("request");
const requestPromise = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");

//Instalamos desde linea de comandos la libreria para convertir JSON a CSV
//npm i json2csv

//Importamos la libreria para convertir Json a formato CSV asi:
const { Parser } = require("json2csv");

//Arrays
//En este Array se guardan los links de las paginas a cargar para Scrapear
let paginationArray = [];

//En este Array se guardan los links de cada una de las empresas para sacarle con scraping los datos
let empresasArray = [];

//En este Array se recopilan todos los datos en FORMATO JSON
let resultObject = [];


//Function asincrona

(async()=>{
    //console.log("Esto es anonimo autoexec");
    try{

        //Get request para traer el HTML de la pagina
        let response = await requestPromise('https://chileservicios.com/empresas/?post_type=empresas&s=tecnologias+de+la+informacion');
        let $ = cheerio.load(response);
        const pageNumber = $('ul.pagination > li').last().prev().find('a').text();
        const number = parseInt(pageNumber);
        
        //console.log(number);

        for(let i=0; i < number; i++)
        {
            if(paginationArray.length == 0)
            {
                paginationArray.push("https://chileservicios.com/empresas/?post_type=empresas&s=tecnologias+de+la+informacion")
            }
            
            else
            {//En esta línea no se utilizan comillas dobles sino comilla inversa para poder inyectar variables entre llaves
                paginationArray.push(`https://chileservicios.com/empresas/page/${i + 1}/?post_type=empresas&s=tecnologias+de+la+informacion`)
            }
        }

        console.log(`El ARRAY Pagination tiene ${paginationArray.length} LINKS para Scraping`);
        //console.log(paginationArray);

        //En este FOR vamos a sacar la pageWeb de todas las empresas que se encuentran en cada pagina identificada con cada URL de paginationArray
        for(let url of paginationArray)
        {
            //En esta parte vamos a sacar la direccion web de cada empresa que se encuentra en la URL del array paginationArray
            response = await requestPromise(url);
            $ = await cheerio.load(response);
            $('div[class="card-body border border-light"] > a').each(function(){
                empresasArray.push($(this).attr('href'))
            });
            //console.log(empresasArray);
            //break;

        }
        console.log(`El ARRAY empresasArray tiene ${empresasArray.length} LINKS para Scraping`);

        //En esta seccion vamos a Scrapear y a construir un JSON con la URL de Cada una de las empresas (Ya teniendo la pageWeb de C/U)
        for(let url of empresasArray)
        {
            response = await requestPromise(url);
            $ = await cheerio.load(response);

            //Sacamos los 5 datos principales de cheerio y los agregamos al array de: empresasArray 
            let title = $('div[class="card-header"] > h1').text();
            let description = $('#page > div > div > div.col-lg-8.my-2 > div > div.card-body > div > div.col-md-8.my-2').text().trim();
            let phone = $('#page > div > div > div.col-lg-4.my-2 > div > div > p:nth-child(2)').text();
            let email = $('#page > div > div > div.col-lg-4.my-2 > div > div > p:nth-child(3)').text().trim();
            let webPage = $('#page > div > div > div.col-lg-4.my-2 > div > div > p:nth-child(4)').text().trim();

            resultObject.push(
                {
                    titulo: title,
                    correo: email,
                    telefono: phone,
                    pagina: webPage,
                    descripción: description,
                }
            );

            //Creamos el archivo JSON externo y lo escribimos en el disco duro-HDD asi:
            let data = JSON.stringify(resultObject);

            fs.writeFileSync('resultObject.json', data);
            //console.log("Item Scrapeado Ok");

            console.log(`${title} scraped OK`);
            /*
            console.log(title);
            console.log(description);
            console.log(phone);
            console.log(email);
            console.log(webPage);
            */

            //console.log(resultObject);
            //break;
        }//Fin del FOR
        
                //Lineas de Prueba
                const title = $("title").text();

                //Convertimos el JSON a CSV Declarando primero los campos:
                const fields = ["titulo", "correo", "telefono", "pagina", "descripción"]; 

                //Creamos una instancia de JSON2CSVParser
                const json2csvParser = new Parser({
                    fields: fields,
                    defaultValue: "No Info",
                });
        

                //Escribimos el JSON2CSVParser en HDD
                const csv = json2csvParser.parse(resultObject);
                fs.writeFileSync(`./results.csv`, csv, "utf-8");
                console.log("CSV Creado OK!");

    }//Fin Try
    catch (error){
        console.error(error);
    }//Fin Catch
})();
