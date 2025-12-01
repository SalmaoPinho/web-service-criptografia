const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const TOKEN = 'Bearer my-secret-token';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runTest = async () => {
    try {
        console.log('--- Starting Verification ---');

        // 1. Create Client
        console.log('\n1. Creating Client...');
        const newCliente = {
            nome: 'Samuel Teste',
            email: 'samuel@teste.com',
            cpf: '111.222.333-44'
        };

        const createRes = await axios.post(`${API_URL}/clientes`, newCliente, {
            headers: { 'Authorization': TOKEN }
        });

        console.log('Create Response:', createRes.data);
        const id = createRes.data.id;

        if (!id) throw new Error('No ID returned');

        // 2. Get Client
        console.log(`\n2. Getting Client (ID: ${id})...`);
        const getRes = await axios.get(`${API_URL}/clientes/${id}`, {
            headers: { 'Authorization': TOKEN }
        });

        console.log('Get Response:', getRes.data);

        // Verify data
        if (getRes.data.cpf === newCliente.cpf) {
            console.log('\nSUCCESS: CPF matches (Decryption worked)!');
        } else {
            console.error('\nFAILURE: CPF mismatch!');
            console.error('Expected:', newCliente.cpf);
            console.error('Got:', getRes.data.cpf);
        }

    } catch (error) {
        console.error('\nTEST FAILED:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
};

// Wait for servers to start
console.log('Waiting for servers to start...');
setTimeout(runTest, 3000);
