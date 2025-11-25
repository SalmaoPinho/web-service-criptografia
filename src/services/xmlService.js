const { parseString, Builder } = require('xml2js');
const { encrypt } = require('../middleware/encryption');

// Estrutura XML para cadastro de cliente
function createClienteXML(clienteData) {
  const builder = new Builder();
  
  // Criptografa dados sensíveis
  const cpfCriptografado = encrypt(clienteData.cpf);
  
  const xmlObj = {
    ClienteRequest: {
      Operacao: 'CADASTRAR_CLIENTE',
      DadosCliente: {
        Nome: clienteData.nome,
        Email: clienteData.email,
        CPF: cpfCriptografado, // CPF criptografado
        DataRegistro: new Date().toISOString()
      }
    }
  };
  
  return builder.buildObject(xmlObj);
}

// Estrutura XML para consulta de cliente
function createConsultaXML(clienteId) {
  const builder = new Builder();
  
  const xmlObj = {
    ClienteRequest: {
      Operacao: 'CONSULTAR_CLIENTE',
      Id: clienteId
    }
  };
  
  return builder.buildObject(xmlObj);
}

// Converter XML para JSON
function xmlToJson(xmlData) {
  return new Promise((resolve, reject) => {
    parseString(xmlData, { explicitArray: false }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = {
  createClienteXML,
  createConsultaXML,
  xmlToJson
};