# Middleware Web Service

Este projeto implementa um Middleware Web Service que atua como uma ponte entre clientes externos (REST/JSON) e um sistema legado simulado (XML).

## Tecnologias Utilizadas
- **Node.js**
- **Express.js**
- **xml2js** (Conversão XML/JSON)
- **crypto** (Criptografia AES-256-CBC)
- **axios** (Cliente HTTP)

## Como Executar

1.  Instale as dependências:
    ```bash
    npm install
    ```
    > **Nota para Windows (PowerShell):** Se encontrar erro de "execução de scripts", use:
    > ```bash
    > cmd /c npm install
    > ```
    > Ou altere a política de execução: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

2.  Inicie o Sistema Legado:
    ```bash
    node src/legacy/server.js
    ```

3.  Inicie o Middleware:
    ```bash
    node src/middleware/index.js
    ```

## Endpoints

### POST /api/clientes
Cadastra um novo cliente.
- **Body**: JSON
- **Auth**: `Bearer my-secret-token`

### GET /api/clientes/:id
Consulta um cliente.
- **Auth**: `Bearer my-secret-token`

## Criptografia
Os dados sensíveis (CPF) são criptografados usando AES-256-CBC antes de serem enviados ao sistema legado.

## Mais Detalhes
Veja o arquivo `explanation.txt` para uma explicação detalhada da arquitetura e funcionamento.
