# Middleware REST para Sistema Legado XML

## Descrição
Middleware Web Service que atua como intermediário entre clientes externos (REST/JSON) e sistema legado (XML), com criptografia de dados sensíveis e comunicação segura via HTTPS.

## Tecnologias Utilizadas
- **Node.js** + **Express** - Servidor web
- **JWT** - Autenticação
- **AES-256-CBC** - Criptografia simétrica
- **HTTPS** - Comunicação segura
- **XML2JS** - Conversão JSON/XML

## Estrutura
1. **Middleware REST** (Porta 3000) - API principal
2. **Sistema Legado Simulado** (Porta 3001) - Serviço legado
3. **Comunicação HTTPS** entre todos os componentes

## Como Executar

### 1. Instalação
```bash
npm install