const express = require('express');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const authMiddleware = require('./middleware/auth');
const clientController = require('./controllers/clientController');

const app = express();
const PORT = 3000;
const LEGACY_PORT = 3001;

// Middleware de segurança
app.use(helmet());
app.use(express.json());
app.use(express.text({ type: 'application/xml' }));

// Middleware de autenticação
app.use(authMiddleware);

// Rotas da API
app.post('/api/clientes', clientController.cadastrarCliente);
app.get('/api/clientes/:id', clientController.consultarCliente);

// Configuração HTTPS
const httpsOptions = {
  key: fs.readFileSync('./certificates/server.key'),
  cert: fs.readFileSync('./certificates/server.cert')
};

// Iniciar servidor HTTPS
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Middleware REST rodando em https://localhost:${PORT}`);
});

module.exports = { LEGACY_PORT };