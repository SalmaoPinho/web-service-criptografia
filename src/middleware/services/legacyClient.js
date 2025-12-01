const axios = require('axios');
const xmlService = require('./xmlService');

const LEGACY_URL = 'http://localhost:3001/legacy';

const createCliente = async (clienteXml) => {
    try {
        const response = await axios.post(`${LEGACY_URL}/clientes`, clienteXml, {
            headers: { 'Content-Type': 'application/xml' }
        });
        return await xmlService.parseXml(response.data);
    } catch (error) {
        console.error('Error calling legacy system:', error.response ? error.response.data : error.message);
        throw new Error('Failed to communicate with legacy system');
    }
};

const getCliente = async (id) => {
    try {
        const response = await axios.get(`${LEGACY_URL}/clientes/${id}`);
        return await xmlService.parseXml(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        console.error('Error calling legacy system:', error.response ? error.response.data : error.message);
        throw new Error('Failed to communicate with legacy system');
    }
};

module.exports = {
    createCliente,
    getCliente
};
