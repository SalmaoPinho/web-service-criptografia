const xml2js = require('xml2js');

const parser = new xml2js.Parser({ explicitArray: false });
const builder = new xml2js.Builder();

const parseXml = async (xml) => {
    return parser.parseStringPromise(xml);
};

const buildXml = (obj) => {
    return builder.buildObject(obj);
};

module.exports = {
    parseXml,
    buildXml
};
