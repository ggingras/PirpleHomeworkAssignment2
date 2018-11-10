const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('../config');
const router = require('./router');
const fs = require('fs');
const path = require('path');

const httpServer = http.createServer((req,res) => {
    console.log('Received an http request');
    handleRequest(req, res);
});

const httpsServerOptions = {
    'key' : fs.readFileSync(path.join(__dirname,'../https/key.pem')),
    'cert' : fs.readFileSync(path.join(__dirname,'../https/cert.pem'))
};

const httpsServer = https.createServer(httpsServerOptions, (req,res) => {
    console.log('Received an https request');
    handleRequest(req, res);
});

function handleRequest(req, res)
{
    let data = parseReq(req);

    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', async () => {
        buffer += decoder.end();
        data.payload = buffer ? JSON.parse(buffer) : {};

        const response = await router.route(data);

        res.setHeader('Content-Type', getContentType(response.contentType));
        res.writeHead(response.statusCode);
        res.end(getPayloadString(response.payload));

        if (response.statusCode == 200)
            console.log('\x1b[32m%s\x1b[0m', 'Returning this response: ',response.statusCode,response.payload);
        else
            console.log('\x1b[31m%s\x1b[0m', 'Returning this response: ',response.statusCode,response.payload);
    });
}

function getPayloadString(payload) {
    contentType = typeof(contentType) == 'string' ? contentType : 'json';
    
    if (contentType == 'json')
        return JSON.stringify(payload);
    else if (contentType == 'html')
        return typeof(payload) == 'string' ? payload : '';

    return typeof(payload) !== 'undefined' ? payload : '';
}

function getContentType(contentType) {
    contentType = typeof(contentType) == 'string' ? contentType : 'json';

    switch (contentType) {
        case 'json':
            return 'iapplication/json';

        case 'jpg':
            return 'image/jpeg';

        case 'png':
            return 'image/png';

        case 'css':
            return 'text/css';

        case 'plain':
            return 'text/plain';

        case 'favicon':
            return 'image/x-icon';

        case 'html':
            return 'text/html';

        default:
            return 'application/json';
    }
}

function parseReq(req)
{
    let parsedUrl = url.parse(req.url, true);

    let data = {
        'path' : parsedUrl.pathname.replace(/^\/+|\/+$/g, ''),
        'queryString' : parsedUrl.query,
        'method' : req.method.toLowerCase(),
        'headers' : req.headers,
      };

    return data;
}

const init = function(){
    httpServer.listen(config.httpPort,() => {
        console.log('\x1b[36m%s\x1b[0m',`The server is up and running on port ${config.httpPort} in ${config.environment} mode`);
    });
    
    httpsServer.listen(config.httpsPort,() => {
        console.log('\x1b[36m%s\x1b[0m',`The server is up and running on port ${config.httpsPort} in ${config.environment} mode`);
    });
};

module.exports = {
    init: init,
};