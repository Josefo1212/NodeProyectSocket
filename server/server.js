import net from 'net';
import { deserializarPeticion, serializarRespuesta } from './comunicationServer.js';
import { loadOperations } from './operationRegistry.js';

const options = {
    port: 3000,
    host: 'localhost'
};

const registry = await loadOperations();

// Convierte valores a numero o devuelve null si no es valido
const toNumber = (value) => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : null
    }

    return null
}

// Valida la peticion y ejecuta la operacion solicitada.
const executeOperation = (request) => {
    if (request?.tipo === 'list') {
        const operations = registry.listOperations().map((operation) => operation.id);
        return { tipo: 'list', operaciones: operations };
    }

    const operation = registry.resolveOperation(request?.operacion);
    const a = toNumber(request?.a);
    const b = toNumber(request?.b);

    if (!operation) {
        return { operacion: request?.operacion ?? null, resultado: null, error: 'Operacion invalida' };
    }

    if (a === null || b === null) {
        return { operacion: operation.id, resultado: null, error: 'Valores invalidos' };
    }

    try {
        const result = operation.execute(a, b);
        const mensaje = operation.message || 'Operacion realizada con exito';

        return { operacion: operation.id, resultado: result, error: null, mensaje };
    } catch (error) {
        return { operacion: operation.id, resultado: null, error: error.message };
    }
};

// Crea el servidor TCP y atiende cada cliente.
const server = net.createServer((socket) => {
    console.log('Client connected')

    // Recibe la peticion, calcula y responde.
    socket.on('data', (data) => {
        let request
        try {
            request = deserializarPeticion(data)
        } catch (error) {
            const response = { operacion: null, resultado: null, error: 'JSON invalido' }
            socket.write(serializarRespuesta(response))
            return
        }

        const response = executeOperation(request);
        console.log('Respuesta enviada al cliente:', response);
        socket.write(serializarRespuesta(response));
    })

    // Maneja errores del socket del cliente
    socket.on('error', (err)=>{
        console.error(`Error: ${err}`)
    })

    // Se ejecuta cuando el cliente se desconecta
    socket.on('end', ()=>{
        console.log('Client disconnected')
    })
})




// Arranca el servidor en el host y puerto indicados.
server.listen(options, () => {
    console.log(`Server listening on host: ${options.host} and port: ${options.port}`)
})