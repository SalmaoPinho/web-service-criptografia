const express = require('express');
const router = express.Router();
const cryptoService = require('./services/cryptoService');
const xmlService = require('./services/xmlService');
const legacyClient = require('./services/legacyClient');

// Middleware for authentication (Simple Token)
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === 'Bearer my-secret-token') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

router.use(authMiddleware);

// POST /api/clientes
router.post('/clientes', async (req, res) => {
    try {
        const { nome, email, cpf } = req.body;

        if (!nome || !email || !cpf) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Encrypt sensitive data
        const encryptedCpf = cryptoService.encrypt(cpf);

        // Build XML for legacy system
        const clienteXmlObj = {
            CadastroCliente: {
                Nome: nome,
                Email: email,
                DadosSensiveis: {
                    CPF: encryptedCpf
                }
            }
        };
        const clienteXml = xmlService.buildXml(clienteXmlObj);

        // Send to legacy system
        const legacyResponse = await legacyClient.createCliente(clienteXml);

        // Process response
        // Legacy response structure: <Resposta><Status>...</Status><Id>...</Id></Resposta>
        const responseId = legacyResponse.Resposta.Id;

        res.status(201).json({
            message: 'Cliente cadastrado com sucesso',
            id: responseId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/clientes/:id
router.get('/clientes/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Call legacy system
        const legacyResponse = await legacyClient.getCliente(id);

        if (!legacyResponse) {
            return res.status(404).json({ error: 'Cliente nao encontrado' });
        }

        // Legacy response structure: <Resposta>...<Cliente>...</Cliente></Resposta>
        // Inside Cliente: <DadosSensiveis><CPF>...</CPF></DadosSensiveis>

        // Note: xml2js might flatten structure depending on options. 
        // With explicitArray: false, it should be object based.

        // Check if Cliente exists in response
        // Based on legacy server: <Resposta><Status>...</Status><Cliente>...</Cliente></Resposta>
        // But wait, createResponse puts data as string? No, template literal.
        // It puts the XML string inside. So xml2js might parse it as nested or we might need to be careful.
        // Let's check legacy server again.
        // createResponse returns string.
        // `... ${data} ...`
        // So <Resposta>...<Cliente>...</Cliente></Resposta> is valid XML.

        const clienteData = legacyResponse.Resposta.Cliente;

        if (!clienteData) {
            return res.status(500).json({ error: 'Invalid response from legacy system' });
        }

        // Decrypt CPF
        const encryptedCpf = clienteData.DadosSensiveis.CPF;
        const decryptedCpf = cryptoService.decrypt(encryptedCpf);

        // Return JSON
        res.json({
            id: clienteData.Id,
            nome: clienteData.Nome,
            email: clienteData.Email,
            cpf: decryptedCpf
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
