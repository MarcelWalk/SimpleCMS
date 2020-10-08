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

app.get('/*', function (req, res) {

    getMdFileNames(nconf.get("content_page_path"))

    let fileName;
    let converter = new showdown.Converter();
    converter.setOption("completeHTMLDocument", false)

    if (req.url === "/") {
        fileName = nconf.get("content_page_path") + "index.md"
    } else {
        if(req.url === "/favicon.ico"){
            res.send(nconf.get("content_page_path")+ req.url.substring(1))
        }else{
            fileName = nconf.get("content_page_path") + req.url.substring(1) + ".md"
        }
        
    }

    try {
        if (fs.existsSync(fileName)) {
            console.log("File exists");
            var data = getFileText(fileName)
            let htmlBodyData = converter.makeHtml(data.toString())

            let template = getFileText(nconf.get("template_path") + nconf.get("template"));
            let html = template.replace("@body" , htmlBodyData)
            html = html.replace("@css" , '<link rel="stylesheet" href="' + nconf.get("css_path") + nconf.get("css") +'">')

            res.send(html);
        }else{
            var data = getFileText(nconf.get("error_page_path") + "404.md")
            res.send(converter.makeHtml(data.toString()));
        }
    } catch (err) {
            console.log("No 404 file found");
    }
});

function getFileText(fileName) {
    try {
        var data = fs.readFileSync(fileName, 'utf8');
        return data.toString();
    } catch (error) {
        console.log("Error reading from file");
    }
}

function getMdFileNames(baseDir){
    glob(baseDir + "/*.md", function (er, files) {
        files.forEach(element => {
            console.log(element.substring(element.lastIndexOf("/")+1));
        });
      })
}

console.log("Listening on:");

app.listen(nconf.get("port"), () => console.log(`http://${ip.address()}:${nconf.get("port")}`));