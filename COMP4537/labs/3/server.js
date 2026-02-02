const http = require('http');
const url = require('url')
const dt = require('./modules/utils')
const fs = require('fs')
const path = `./Data/file.txt`;
const Greeting = require('./lang/messages/en/en.js')

class Server {
    constructor(port) {
        this.port = port;
        this.server = http.createServer((req,res) => this.handleRequest(req,res));
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Server is listening on port ${this.port}`);
        });
    }

    handleRequest(req,res) {
        const parseUrl = url.parse(req.url, true);

        if (parseUrl.pathname === '/COMP4537/labs/3/getDate/') {
            const name = parseUrl.query.name || "Guest";
            this.showDate(name,res);
        }
        else if (parseUrl.pathname === '/COMP4537/labs/3/writeFile/'){
            const text = parseUrl.query.text
            this.writeFile(text, res)
        }
        else if (parseUrl.pathname === '/COMP4537/labs/3/readFile/file.txt'){
            this.readFile(res)
        }
        else {
            res.writeHead(404, {'Content-type' : 'text/plain'});
            res.end('404 Not Found')
        }
    }
    showDate(name, res) {
        const currentDate = dt.getDate();

        let message = Greeting.message.replace('%1',name).replace('%2', currentDate);
        const format = `<div style="color:blue";> ${message} </div>`
        res.writeHead(200, {'Content-type' : 'text/html'})
        res.end(format);
    }
    writeFile(text, res) {

        if (text === undefined) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            return res.end('Bad Request: "text" query parameter is missing.');
        }
        
        fs.appendFile(path, text + '\n', (err) => {
            if (err) {
                console.log(err);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end(`Error writing file: ${err.message}`);
            }
            res.writeHead(200, {'Content-type' : 'text/plain'})
            res.end(`Successfully appended: "${text}" to file.txt.`)
    });
}
    readFile(res) {
        fs.readFile(path, 'utf8', (err, data) => {

            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(`file.txt 404 Not Found!`);
            }
            else{
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.write(data);
                res.end();
            }
        });
    }
}

const PORT = 8000;
const SERVER = new Server(PORT);
SERVER.start();