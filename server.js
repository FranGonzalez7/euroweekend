const http = require('http');
const fs = require('fs');
const path = require('path');

const DATOS_PATH = './datos.json';

function leerDatos() {
    return JSON.parse(fs.readFileSync(DATOS_PATH, 'utf8'));
}

function guardarDatos(datos) {
    fs.writeFileSync(DATOS_PATH, JSON.stringify(datos, null, 2));
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Servir archivos estáticos
    if (req.method === 'GET' && !req.url.startsWith('/api')) {
        let filePath = '.' + req.url;
        if (filePath === './') filePath = './index.html';
        const ext = path.extname(filePath);
        const tipos = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
        fs.readFile(filePath, (err, data) => {
            if (err) { res.writeHead(404); res.end('No encontrado'); return; }
            res.writeHead(200, { 'Content-Type': tipos[ext] || 'text/plain' });
            res.end(data);
        });
        return;
    }

    // API: obtener todos los datos
    if (req.method === 'GET' && req.url === '/api/datos') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(leerDatos()));
        return;
    }

    // API: guardar todos los datos
    if (req.method === 'POST' && req.url === '/api/datos') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            guardarDatos(JSON.parse(body));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
        });
        return;
    }

    res.writeHead(404);
    res.end();
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Servidor corriendo en http://localhost:3000');
    console.log('Tus amigos pueden acceder desde la misma WiFi');
});
```

Cuando lo tengas, arráncalo desde la terminal de VS Code con:
```
//node server.js