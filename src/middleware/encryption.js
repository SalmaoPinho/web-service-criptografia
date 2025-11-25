const crypto = require('crypto');

/**
 * ALGORITMO: AES-256-CBC
 * - Criptografia simétrica robusta
 * - Usa vetor de inicialização (IV) para maior segurança
 * - Adequado para dados sensíveis como CPF
 */
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from('chave_de_32_bytes_para_aes_256_cbc_2024', 'utf8'); // 32 bytes para AES-256

// Função para criptografar dados sensíveis
function encrypt(text) {
  try {
    const iv = crypto.randomBytes(16); // IV aleatório para cada criptografia
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Retorna IV + texto criptografado (IV necessário para descriptografia)
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    throw new Error(`Erro na criptografia: ${error.message}`);
  }
}

// Função para descriptografar dados
function decrypt(encryptedText) {
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Erro na descriptografia: ${error.message}`);
  }
}

module.exports = {
  encrypt,
  decrypt,
  ALGORITHM
};