const https = require('https');
const fs = require('fs');
const { LEGACY_PORT } = require('../app');

// Configuração HTTPS para comunicação com legado
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Em produção, usar certificados válidos
  cert: fs.readFileSync('./certificates/server.cert'),
  key: fs.readFileSync('./certificates/server.key')
});

// Enviar requisição para sistema legado
async function sendToLegacySystem(xmlData, operation) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: LEGACY_PORT,
      path: '/legacy/api',
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Content-Length': Buffer.byteLength(xmlData),
        'X-Operation': operation
      },
      agent: httpsAgent
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Erro na comunicação com sistema legado: ${error.message}`));
    });

    req.write(xmlData);
    req.end();
  });
}

module.exports = {
  sendToLegacySystem
};