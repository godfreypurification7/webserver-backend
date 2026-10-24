const logEvents = require('./data/logEvents');
const EventEmitter = require('events');
const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises=require('fs').promises;

class Emitter extends EventEmitter {}

const myEmitter = new Emitter();
// Register the logging event
myEmitter.on('log', (msg, filename) => {
    logEvents(msg, filename);
});

const PORT = process.env.PORT || 3500;

const fileServer=async(filePath, contentType, response)=>{
    try{
        const rawData=await fsPromises.readFile(
        filePath, 
        !contentType.includes('image') ? 'utf8' : ''
    );
        
        const data=contentType ==='application/json'
        ? JSON.parse(rawData): rawData;
        response.writeHead(
            filePath.includes('404.html') ? 404 : 200, 
            {'Content-Type': contentType});
        response.end(
            contentType==='application/json' 
            ? JSON.stringify(data) : data
        );
        
    }catch(err){
        console.log(err);
        myEmitter.emit('log', `${err.name}\t${err.message}`, 'errLog.txt')
        response.statusCode=500;
        response.end();
    }
}

const server = http.createServer((req, res) => {
    console.log(req.url, req.method);
    myEmitter.emit('log', `${req.url}\t${req.method}`, 'reqLog.txt')

    // Determine the requested file extension
    const extension = path.extname(req.url);

    let contentType;

    switch (extension) {
        case '.css':
            contentType = 'text/css';
            break;

        case '.js':
            contentType = 'text/javascript';
            break;

        case '.json':
            contentType = 'application/json';
            break;

        case '.jpg':
            contentType = 'image/jpeg';
            break;

        case '.png':
            contentType = 'image/png';
            break;

        case '.txt':
            contentType = 'text/plain';
            break;

        default:
            contentType = 'text/html';
            break;
    }

    // Determine the requested file path
    let filePath =
        contentType === 'text/html' && req.url === '/'
            ? path.join(__dirname, 'views', 'index.html')
            : contentType === 'text/html' && req.url.endsWith('/')
                ? path.join(__dirname, 'views', req.url, 'index.html')
                : contentType === 'text/html'
                    ? path.join(__dirname, 'views', req.url)
                    : path.join(__dirname, req.url);

    // Add .html if the URL has no extension
    if (!extension && !req.url.endsWith('/')) {
        filePath += '.html';
    }
if (fs.existsSync(filePath)) {
    fileServer(filePath, contentType, res);



    // // Check whether the requested file exists
    // fs.exists(filePath, (exists) => {
    //     if (exists) {
    //         // Serve the requested file
    //         fs.readFile(filePath, (err, data) => {
    //             if (err) {
    //                 res.statusCode = 500;
    //                 res.end('Internal Server Error');
    //                 return;
    //             }

    //             res.writeHead(200, {
    //                 'Content-Type': contentType
    //             });

    //             res.end(data);
    //         });
        } else {
            switch(path.parse(filePath).base){
            case 'old-page.html':
                res.writeHead(301, {'Location':
                    '/new-page.html'
                });
                res.end();
                break 
            case 'www.-page/html':
                res.writeHead(301, {'Location':
                    '/'
                });
                res.end();
                break 
            default:
                fileServer(path.join(__dirname, 
                    'views', '404.html'), 
                    'text/html',res);
                ////serve a 404 response    
           };
        }
    });

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
