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

        let response = await requestPromise('https://lobbycanada.gc.ca/app/secure/ocl/lrs/do/clntOrgCrpLstg?pfx=C#');
        let $ = cheerio.load(response);

        //***********************************************************************************************************
        //En esta Primera parte vamos a llenar el array paginationArray con las URLs de la paginación del sitio Ppal
        //***********************************************************************************************************
         $('li[class="mrgn-bttm-sm"] > strong > a').each(function()
         {
            paginationArray.push("https://lobbycanada.gc.ca"+($(this).attr('href')))
         });
      

         console.log(`El ARRAY Pagination tiene ${paginationArray.length} pestañas de la A al 9 para Scraping`);

         //*********************************************************************************************
         //En esta Segunda parte vamos a sacar los atributos de cada URL por Filas asi:
         //*********************************************************************************************
         for(let url of paginationArray)
         {
            response = await requestPromise(url);
            $ = cheerio.load(response);

            $('tbody tr').each((index, row) => {
                const primerTD = $(row).find('td:nth-child(1)').text().trim();
                empresasArray.push(primerTD);

            });

            console.log(empresasArray);
            console.log(`El ARRAY empresasArray tiene ${empresasArray.length} LINKS para Scraping`);

/*   
             //Sacamos los 2 datos principales de cheerio y los agregamos al array de: resultObject 
             let organization = $('li[class="mrgn-bttm-sm"] > strong > a').text();
             let organization = $('#wb-auto-2_wrapper > table[class="wb-tables table table-bordered table-striped wb-init wb-tables-inited dataTable no-footer"] > tbody > tr > td[class="sorting_1"]').text();
             esteOK------console.log("Organization contiene esto :", $('tbody tr td').first().text().trim());
             ('div[class="card-body border border-light"] > a')
             ('div[class="card-header"] > h1')
             ('#page > div > div > div.col-lg-4.my-2 > div > div > p:nth-child(4)')
             $('#confirma_clave');
*/
             //break;
         }//Fin del FOR


         //********************************************************************************************************************************
         //En esta 3ra Parte vamos a Scrapear y a construir un JSON con la URL de Cada una de las empresas (Ya teniendo la pageWeb de C/U)
         //********************************************************************************************************************************
        for(let nombreCompany of empresasArray)
        {
            resultObject.push
            (
                {
                    companyName: nombreCompany,
                }
            );

            //Creamos el archivo JSON externo y lo escribimos en el disco duro-HDD asi:
            let data = JSON.stringify(resultObject);

            fs.writeFileSync('resultObject.json', data);
            console.log("Item Scrapeado Ok");

        }//Fin del FOR

                console.log(resultObject);

        
                //Lineas de Prueba
                //const title = $("title").text();

                //Convertimos el JSON a CSV Declarando primero los campos:
                const fields = ["companyName"]; 

                //Creamos una instancia de JSON2CSVParser
                const json2csvParser = new Parser({
                    fields: fields,
                    defaultValue: "No Info",
                });
                

                //Escribimos el JSON2CSVParser en HDD
                const csv = json2csvParser.parse(resultObject);
                fs.writeFileSync(`./results-App2.csv`, csv, "utf-8");
                console.log("CSV Creado OK!");

    }//Fin Try
    catch (error){
        console.error(error);
    }//Fin Catch
})();
