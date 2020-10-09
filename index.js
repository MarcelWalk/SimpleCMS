const express = require('express');
var ip = require("ip");
const fs = require('fs')
var showdown = require('showdown');
var favicon = require('serve-favicon')
var nconf = require('nconf');
var path = require('path')
var glob = require("glob")

var app = express();

//Load config
nconf.use('file', {
    file: './config.json'
});
nconf.load();

//For static ressources (vue.js)
app.use(express.static(__dirname));
app.use(favicon(nconf.get("content_page_path") + 'favicon.ico'))

//Trigger on every request
app.get('/*', function (req, res) {

    //Get all files in content folder so I can use it in the nav later
    getMdFileNames(nconf.get("content_page_path"))

    let fileName;

    //Initialize MD converter and tell him to just give plain html
    let converter = new showdown.Converter();
    converter.setOption("completeHTMLDocument", false)

    //Check if root is requested
    if (req.url === "/") {

        //requested file is index file
        fileName = nconf.get("content_page_path") + "index.md"

    } else {
        fileName = nconf.get("content_page_path") + req.url.substring(1) + ".md"
    }

    try {

        //Check if file exists
        if (fs.existsSync(fileName)) {
            
            //Get text from md file
            var data = getFileText(fileName)

            //Convert md to html
            let htmlBodyData = converter.makeHtml(data.toString())

            //Fill template with custom css and converted md data
            let template = getFileText(nconf.get("template_path") + nconf.get("template"));
            let html = template.replace("@body", htmlBodyData)
            html = html.replace("@css", '<link rel="stylesheet" href="' + nconf.get("css_path") + nconf.get("css") + '">')

            //Serve filled template
            res.send(html);

        } else {

            //File doesnt exist serve 404 file
            var data = getFileText(nconf.get("error_page_path") + "404.md")
            res.send(converter.makeHtml(data.toString()));

        }
    } catch (err) {

        console.log("No 404 file found");

    }
});

//Gets the content of a file
function getFileText(fileName) {
    try {
        var data = fs.readFileSync(fileName, 'utf8');
        return data.toString();
    } catch (error) {
        console.log("Error reading from file");
    }
}

//Gets all md files from a directory
function getMdFileNames(baseDir) {
    glob(baseDir + "/*.md", function (er, files) {
        files.forEach(element => {
            console.log(element.substring(element.lastIndexOf("/") + 1));
        });
    })
}

console.log("Listening on:");

app.listen(nconf.get("port"), () => console.log(`http://${ip.address()}:${nconf.get("port")}`));