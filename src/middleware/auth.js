const jwt = require('jsonwebtoken');

const JWT_SECRET = 'chave_secreta_middleware_2024';

// Middleware de autenticação JWT
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token de autenticação necessário',
      code: 'AUTH_REQUIRED'
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido ou expirado',
      code: 'INVALID_TOKEN'
    });
  }
};

// Função para gerar token (usar em endpoint de login)
const generateToken = (userId) => {
  return jwt.sign({ userId, role: 'api_client' }, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = authMiddleware;
module.exports.generateToken = generateToken;