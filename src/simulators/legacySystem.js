const express = require('express');
const https = require('https');
const fs = require('fs');
const { parseString } = require('xml2js');
const { decrypt, encrypt } = require('../middleware/encryption');

const app = express();
const PORT = 3001;

// Banco de dados simulado em memória
let clientesDB = [];
let currentId = 1;

app.use(express.text({ type: 'application/xml' }));

// Endpoint do sistema legado
app.post('/legacy/api', async (req, res) => {
  try {
    const operation = req.headers['x-operation'];
    const xmlData = req.body;

    // Converter XML para JSON
    const result = await new Promise((resolve, reject) => {
      parseString(xmlData, { explicitArray: false }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const requestData = result.ClienteRequest;

    if (operation === 'CADASTRAR_CLIENTE') {
      // Processar cadastro
      const cliente = {
        id: currentId++,
        nome: requestData.DadosCliente.Nome,
        email: requestData.DadosCliente.Email,
        cpf: requestData.DadosCliente.CPF, // Já vem criptografado do middleware
        dataRegistro: requestData.DadosCliente.DataRegistro
      };

      clientesDB.push(cliente);

      // Retornar resposta em XML
      const responseXML = `
        <ClienteResponse>
          <Status>SUCESSO</Status>
          <Mensagem>Cliente cadastrado com sucesso</Mensagem>
          <IdConfirmacao>${cliente.id}</IdConfirmacao>
          <DataProcessamento>${new Date().toISOString()}</DataProcessamento>
        </ClienteResponse>
      `;

      res.set('Content-Type', 'application/xml');
      res.send(responseXML);

    } else if (operation === 'CONSULTAR_CLIENTE') {
      // Processar consulta
      const clienteId = parseInt(requestData.Id);
      const cliente = clientesDB.find(c => c.id === clienteId);

      if (!cliente) {
        const errorXML = `
          <ClienteResponse>
            <Status>ERRO</Status>
            <Mensagem>Cliente não encontrado</Mensagem>
            <DataProcessamento>${new Date().toISOString()}</DataProcessamento>
          </ClienteResponse>
        `;
        res.status(404).set('Content-Type', 'application/xml').send(errorXML);
        return;
      }

      // Retornar dados do cliente (CPF permanece criptografado)
      const responseXML = `
        <ClienteResponse>
          <Status>SUCESSO</Status>
          <DadosCliente>
            <Id>${cliente.id}</Id>
            <Nome>${cliente.nome}</Nome>
            <Email>${cliente.email}</Email>
            <CPF>${cliente.cpf}</CPF>
            <DataRegistro>${cliente.dataRegistro}</DataRegistro>
          </DadosCliente>
          <DataProcessamento>${new Date().toISOString()}</DataProcessamento>
        </ClienteResponse>
      `;

      res.set('Content-Type', 'application/xml');
      res.send(responseXML);
    } else {
      throw new Error('Operação não suportada');
    }

  } catch (error) {
    console.error('Erro no sistema legado:', error);
    const errorXML = `
      <ClienteResponse>
        <Status>ERRO</Status>
        <Mensagem>Erro no processamento: ${error.message}</Mensagem>
        <DataProcessamento>${new Date().toISOString()}</DataProcessamento>
      </ClienteResponse>
    `;
    res.status(500).set('Content-Type', 'application/xml').send(errorXML);
  }
});

// Configuração HTTPS
const httpsOptions = {
  key: fs.readFileSync('./certificates/server.key'),
  cert: fs.readFileSync('./certificates/server.cert')
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Sistema Legado simulado rodando em https://localhost:${PORT}`);
});