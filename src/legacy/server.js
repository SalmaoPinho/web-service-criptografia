const express = require('express');
const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);

const app = express();
const PORT = 3001;

// Middleware to parse XML body
app.use(bodyParser.xml());

// In-memory database
const clientes = [];

// Helper to create XML response
const createResponse = (status, message, data = '') => {
    return `
    <Resposta>
        <Status>${status}</Status>
        <Mensagem>${message}</Mensagem>
        ${data}
    </Resposta>
    `;
};

app.post('/legacy/clientes', (req, res) => {
    console.log('Legacy System received POST request');
    const body = req.body;
    
    // Extract data from XML (assuming body-parser-xml gives us a JS object)
    // Structure: <CadastroCliente><Nome>...</Nome>...</CadastroCliente>
    try {
        const cadastro = body.CadastroCliente;
        if (!cadastro) {
            throw new Error('Invalid XML structure');
        }

        const newId = clientes.length + 1;
        const novoCliente = {
            id: newId,
            ...cadastro
        };
        clientes.push(novoCliente);

        console.log('Legacy System stored:', novoCliente);

        res.set('Content-Type', 'application/xml');
        res.send(createResponse('Sucesso', 'Cliente cadastrado com sucesso', `<Id>${newId}</Id>`));
    } catch (error) {
        console.error('Legacy Error:', error);
        res.status(400).send(createResponse('Erro', error.message));
    }
});

app.get('/legacy/clientes/:id', (req, res) => {
    console.log(`Legacy System received GET request for ID: ${req.params.id}`);
    const id = parseInt(req.params.id);
    const cliente = clientes.find(c => c.id === id);

    res.set('Content-Type', 'application/xml');
    if (cliente) {
        // Construct XML with the stored data (which should contain encrypted fields)
        const clienteXml = `
        <Cliente>
            <Id>${cliente.id}</Id>
            <Nome>${cliente.Nome}</Nome>
            <Email>${cliente.Email}</Email>
            <DadosSensiveis>
                <CPF>${cliente.DadosSensiveis[0].CPF[0]}</CPF>
            </DadosSensiveis>
        </Cliente>
        `;
        res.send(createResponse('Sucesso', 'Cliente encontrado', clienteXml));
    } else {
        res.status(404).send(createResponse('Erro', 'Cliente nao encontrado'));
    }
});

app.listen(PORT, () => {
    console.log(`Legacy System running on port ${PORT}`);
});
