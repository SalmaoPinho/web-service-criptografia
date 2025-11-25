const { createClienteXML, createConsultaXML, xmlToJson } = require('../services/xmlService');
const { sendToLegacySystem } = require('../services/legacyService');
const { decrypt } = require('../middleware/encryption');

// POST /api/clientes - Cadastrar novo cliente
async function cadastrarCliente(req, res) {
  try {
    const { nome, email, cpf } = req.body;

    // Validação básica
    if (!nome || !email || !cpf) {
      return res.status(400).json({
        error: 'Dados incompletos',
        details: 'Nome, email e CPF são obrigatórios',
        code: 'INVALID_DATA'
      });
    }

    // Validação de CPF simples
    if (!/^\d{11}$/.test(cpf)) {
      return res.status(400).json({
        error: 'CPF inválido',
        details: 'CPF deve conter 11 dígitos numéricos',
        code: 'INVALID_CPF'
      });
    }

    // Criar XML para sistema legado
    const xmlData = createClienteXML({ nome, email, cpf });

    // Enviar para sistema legado
    const legacyResponse = await sendToLegacySystem(xmlData, 'CADASTRAR_CLIENTE');

    if (legacyResponse.statusCode !== 200) {
      throw new Error('Erro no sistema legado');
    }

    // Processar resposta do legado
    const responseJson = await xmlToJson(legacyResponse.data);
    const legacyData = responseJson.ClienteResponse;

    res.status(201).json({
      success: true,
      message: 'Cliente cadastrado com sucesso',
      id: legacyData.IdConfirmacao,
      timestamp: legacyData.DataProcessamento
    });

  } catch (error) {
    console.error('Erro no cadastro de cliente:', error);
    res.status(500).json({
      error: 'Erro interno no processamento',
      details: error.message,
      code: 'INTERNAL_ERROR'
    });
  }
}

// GET /api/clientes/:id - Consultar cliente
async function consultarCliente(req, res) {
  try {
    const clienteId = req.params.id;

    if (!clienteId) {
      return res.status(400).json({
        error: 'ID do cliente não informado',
        code: 'MISSING_ID'
      });
    }

    // Criar XML de consulta
    const xmlData = createConsultaXML(clienteId);

    // Enviar para sistema legado
    const legacyResponse = await sendToLegacySystem(xmlData, 'CONSULTAR_CLIENTE');

    if (legacyResponse.statusCode === 404) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    if (legacyResponse.statusCode !== 200) {
      throw new Error('Erro no sistema legado');
    }

    // Processar resposta do legado
    const responseJson = await xmlToJson(legacyResponse.data);
    const legacyData = responseJson.ClienteResponse;

    // Descriptografar dados sensíveis
    const cpfDescriptografado = decrypt(legacyData.DadosCliente.CPF);

    // Retornar dados formatados para cliente
    res.json({
      id: legacyData.DadosCliente.Id,
      nome: legacyData.DadosCliente.Nome,
      email: legacyData.DadosCliente.Email,
      cpf: cpfDescriptografado,
      dataRegistro: legacyData.DadosCliente.DataRegistro,
      dataConsulta: legacyData.DataProcessamento
    });

  } catch (error) {
    console.error('Erro na consulta de cliente:', error);
    res.status(500).json({
      error: 'Erro interno no processamento',
      details: error.message,
      code: 'INTERNAL_ERROR'
    });
  }
}

module.exports = {
  cadastrarCliente,
  consultarCliente
};