
import net from 'net';
import { serializarPeticion, deserializarRespuesta } from './comunicationClient.js';
import { promptRequest } from './inputClient.js';

//puertos definidos
const options = {
    port: 3000,
    host: 'localhost'
};

// Formatea la respuesta del servidor para mostrarla al usuario
// defino el formatResponse para transformar el objeto de respuesta del servidor en un texto legible
const formatResponse = (response) => {
    if (!response || typeof response !== 'object') {
        return 'Respuesta invalida';
    }

    if (response.tipo === 'list') {
        return null;
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


// Abre la conexion TCP y arranca el primer pedido
const client = net.createConnection(options, () => {
    console.log('Connected to server');
    requestOperations();
});

let availableOperations = [];

const requestOperations = () => {
    const request = { tipo: 'list' };
    client.write(serializarPeticion(request));
};

// Pide datos al usuario y envia la peticion al servidor
async function handleRequest() {
    const request = await promptRequest(availableOperations);
    // Permitir salir escribiendo "salir" como operación
    if (request.operacion && request.operacion.trim().toLowerCase() === 'salir') {
        client.end();
        return;
    }
    client.write(serializarPeticion(request));
}

// Recibe la respuesta del servidor y vuelve a pedir otra operacion.
client.on('data', (data) => {
    let response;
    try {
        response = deserializarRespuesta(data);
    } catch (error) {
        console.error('No se pudo leer la respuesta del servidor');
        client.end();
        return;
    }

    if (response?.tipo === 'list') {
        availableOperations = Array.isArray(response.operaciones)
            ? response.operaciones
            : [];
        handleRequest();
        return;
    }

    const message = formatResponse(response);
    if (message) {
        console.log(message);
    }
    // Volver a pedir otra operación
    handleRequest();
});

// Maneja errores de red del cliente
client.on('error', (err) => {
    console.error(`Client error: ${err}`)
})

//ejecuta cuando el servidor cierra la conexión
client.on('end', () => {
    console.log('Disconnected from server')
})