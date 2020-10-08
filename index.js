const express = require('express');
var ip = require("ip");
const fs = require('fs')
var showdown = require('showdown');

var app = express();

const PORT = 3000;
const CONTENT_PATH = "./content/";

//For static ressources (vue.js)
app.use(express.static(__dirname));

app.get('/*', function (req, res) {

    let fileName;
    let converter = new showdown.Converter();

    if (req.url === "/") {
        fileName = CONTENT_PATH + "index.md"
    } else {
        fileName = CONTENT_PATH + req.url.substring(1) + ".md"
    }

    try {
        if (fs.existsSync(fileName)) {
            console.log("File exists");
            var data = getFileText(fileName)

            res.send(converter.makeHtml(data.toString()));
        }else{
            var data = getFileText(CONTENT_PATH + "404.md")
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

console.log("Listening on:");
app.listen(PORT, () => console.log(`http://${ip.address()}:${PORT}`));