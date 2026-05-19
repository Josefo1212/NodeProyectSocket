
import net from 'net';
import { serializarPeticion, deserializarRespuesta } from './comunicationClient.js';
import { promptRequest } from './inputClient.js';

const options = {
    port: 3000,
    host: 'localhost'
};

const formatResponse = (response) => {
    if (!response || typeof response !== 'object') {
        return 'Respuesta invalida';
    }

    if (response.error) {
        return `Operacion: ${response.operacion ?? 'N/A'} | Error: ${response.error}`;
    }

    let msg = `Operacion: ${response.operacion ?? 'N/A'} | Resultado: ${response.resultado}`;
    if (response.mensaje) {
        msg += ` | ${response.mensaje}`;
    }
    return msg;
};


const client = net.createConnection(options, () => {
    console.log('Connected to server');
    handleRequest();
});

async function handleRequest() {
    const request = await promptRequest();
    // Permitir salir escribiendo "salir" como operación
    if (request.operacion && request.operacion.trim().toLowerCase() === 'salir') {
        client.end();
        return;
    }
    client.write(serializarPeticion(request));
}

client.on('data', (data) => {
    let response;
    try {
        response = deserializarRespuesta(data);
    } catch (error) {
        console.error('No se pudo leer la respuesta del servidor');
        client.end();
        return;
    }

    console.log(formatResponse(response));
    // Volver a pedir otra operación
    handleRequest();
});

client.on('error', (err) => {
    console.error(`Client error: ${err}`)
})

client.on('end', () => {
    console.log('Disconnected from server')
})