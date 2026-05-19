
import net from 'net';
import { serializeRequest, deserializeResponse } from './comunicationClient.js';
import { buildMenu, promptRequest } from './inputClient.js';

let client = null;
let buffer = '';

const sendRequest = (payload) => {
    const frame = serializeRequest(payload);
    console.log('[TX]', JSON.stringify(payload));
    client.write(frame);
};

const requestCatalog = () => {
    sendRequest({ tipo: 'catalog' });
};

const handleDataMessage = async (rawMessage) => {
    let respuesta;
    try {
        respuesta = deserializeResponse(rawMessage);
    } catch (error) {
        console.error('No se pudo leer la respuesta del servidor');
        client.end();
        return;
    }

    if (respuesta?.tipo === 'catalog') {
        const catalog = Array.isArray(respuesta.clases) ? respuesta.clases : [];
        buildMenu(catalog);
    } else {
        console.log('\n--------------------------------------------------');
        if (respuesta?.error) {
            console.log(`❌ Error en la operación: ${respuesta.error}`);
        } else {
            console.log(`✅ El resultado de la operación fue: ${respuesta?.resultado}`);
        }
        console.log('--------------------------------------------------\n');
    }

    const nextRequest = await promptRequest();
    if (nextRequest?.salir) {
        client.end();
        return;
    }
    if (nextRequest) {
        sendRequest(nextRequest);
    }
};

const onData = (data) => {
    buffer += data.toString();

    let boundary = buffer.indexOf('\n');
    while (boundary !== -1) {
        const rawMessage = buffer.slice(0, boundary).trim();
        buffer = buffer.slice(boundary + 1);

        if (rawMessage.length > 0) {
            handleDataMessage(rawMessage);
        }

        boundary = buffer.indexOf('\n');
    }
};

const startClient = (options) => {
    client = net.createConnection(options, () => {
        console.log('Connected to server');
        requestCatalog();
    });

    client.on('data', (data) => onData(data));

    client.on('error', (err) => {
        console.error(`Client error: ${err.message}`);
    });

    client.on('end', () => {
        console.log('Disconnected from server');
    });
};

const options = {
    port: 3000,
    host: '127.0.0.1'
};

startClient(options);