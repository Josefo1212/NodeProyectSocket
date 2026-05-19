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
    // Si el cliente pide la lista de operaciones, se la devolvemos sin intentar ejecutar nada
    if (request?.tipo === 'list') {
        const operations = registry.listOperations().map((operation) => operation.id);
        return { tipo: 'list', operaciones: operations };
    }

    const operation = registry.resolveOperation(request?.operacion);
    const rawParams = Array.isArray(request?.parametros)
        ? request.parametros
        : [request?.a, request?.b];
    const parametros = rawParams.map((value) => toNumber(value));

    // Si no se encuentra la operacion, o los valores no son validos, devolvemos un error indicando el problema
    if (!operation) {
        return { operacion: request?.operacion ?? null, resultado: null, error: 'Operacion invalida' };
    }
    if (parametros.length < 2 || parametros.some((value) => value === null)) {
        return { operacion: operation.id, resultado: null, error: 'Valores invalidos' };
    }

    // Si todo es valido, ejecutamos la operacion y devolvemos el resultado, manejando cualquier error que pueda ocurrir durante la ejecucion
    try {
        const result = operation.execute(parametros);
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
        // convertimos la peticion del cliente a un objeto, si falla respondemos con un error indicando que el JSON es invalido
        try {
            request = deserializarPeticion(data)
        } catch (error) {
            const response = { operacion: null, resultado: null, error: 'JSON invalido' }
            socket.write(serializarRespuesta(response))
            return
        }

        // Ejecutamos la operacion solicitada y enviamos la respuesta al cliente, si ocurre un error durante la ejecucion se maneja dentro de executeOperation
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