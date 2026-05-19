import net from 'net';
import { deserializarPeticion, serializarRespuesta } from './comunicationServer.js';
import Calculator from './calculator.js';

const options = {
    port: 3000,
    host: 'localhost'
};

const calculator = new Calculator();

const normalizeOperation = (operation) => {
    if (!operation) {
        return null
    }

    const value = String(operation).trim().toLowerCase()

    if (value === 'suma' || value === '+') return 'suma'
    if (value === 'resta' || value === '-') return 'resta'
    if (value === 'multiplicacion' || value === '*') return 'multiplicacion'
    if (value === 'division' || value === '/') return 'division'

    return null
}

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

const executeOperation = (request) => {
    const operation = normalizeOperation(request?.operacion);
    const a = toNumber(request?.a);
    const b = toNumber(request?.b);

    if (!operation) {
        return { operacion: request?.operacion ?? null, resultado: null, error: 'Operacion invalida' };
    }

    if (a === null || b === null) {
        return { operacion: operation, resultado: null, error: 'Valores invalidos' };
    }

    try {
        let result;
        let mensaje = '';
        if (operation === 'suma') {
            result = calculator.add(a, b);
            mensaje = 'Operacion suma realizada con exito';
        }
        if (operation === 'resta') {
            result = calculator.subtract(a, b);
            mensaje = 'Operacion resta realizada con exito';
        }
        if (operation === 'multiplicacion') {
            result = calculator.multiply(a, b);
            mensaje = 'Operacion multiplicacion realizada con exito';
        }
        if (operation === 'division') {
            result = calculator.divide(a, b);
            mensaje = 'Operacion division realizada con exito';
        }

        return { operacion: operation, resultado: result, error: null, mensaje };
    } catch (error) {
        return { operacion: operation, resultado: null, error: error.message };
    }
};

const server = net.createServer((socket) => {
    console.log('Client connected')

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

    socket.on('error', (err)=>{
        console.error(`Error: ${err}`)
    })

    socket.on('end', ()=>{
        console.log('Client disconnected')
    })
})




server.listen(options, () => {
    console.log(`Server listening on host: ${options.host} and port: ${options.port}`)
})