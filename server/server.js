import net from 'net';
import Calculator from './classes/Calculator.js';
import Frases from './classes/Frases.js';

const normalizeKey = (value) => String(value ?? '').trim();

const registry = {
    Calculator: {
        ClassCtor: Calculator
    },
    Frases: {
        ClassCtor: Frases
    }
};

const buildCatalogResponse = () => {
    const clases = Object.entries(registry).map(([name, record]) => {
        const protoMethods = Object.getOwnPropertyNames(record.ClassCtor.prototype)
            .filter((methodName) => methodName !== 'constructor')
            .filter((methodName) => typeof record.ClassCtor.prototype[methodName] === 'function');

        return {
            name,
            methods: protoMethods
        };
    });

    return { tipo: 'catalog', clases };
};

const resolveParams = (request) => {
    if (Array.isArray(request?.parametros)) {
        return request.parametros;
    }
    if (Array.isArray(request?.params)) {
        return request.params;
    }
    return [];
};

const parseNumericParams = (params) => {
    const parsed = params.map((value) => Number(value));
    const numericMask = parsed.map((value) => Number.isFinite(value));

    if (numericMask.every((value) => value)) {
        return { kind: 'numbers', values: parsed };
    }

    if (numericMask.every((value) => !value)) {
        return { kind: 'strings', values: params.map((value) => String(value)) };
    }

    return { kind: 'mixed', values: [] };
};

const executeRequest = (request) => {
    if (request?.tipo === 'catalog') {
        return buildCatalogResponse();
    }

    const className = normalizeKey(request?.clase);
    const methodName = normalizeKey(request?.metodo);
    const classRecord = registry[className];
    const rawParams = resolveParams(request);

    if (!classRecord) {
        return { clase: className || null, metodo: methodName || null, resultado: null, error: 'Clase invalida' };
    }

    if (!methodName) {
        return { clase: className, metodo: methodName || null, resultado: null, error: 'Metodo invalido' };
    }

    try {
        const instance = new classRecord.ClassCtor();
        const handler = instance[methodName];
        if (typeof handler !== 'function') {
            return { clase: className, metodo: methodName, resultado: null, error: 'Metodo invalido' };
        }

        const params = Array.isArray(rawParams) ? rawParams : [];
        const parsed = parseNumericParams(params);

        if (parsed.kind === 'mixed') {
            return { clase: className, metodo: methodName, resultado: null, error: 'Parametros mixtos' };
        }

        if (parsed.kind === 'numbers') {
            if (parsed.values.length < 2) {
                return { clase: className, metodo: methodName, resultado: null, error: 'Se requieren al menos 2 parametros' };
            }

            const result = parsed.values.reduce((acc, value) => handler.call(instance, acc, value));
            return { clase: className, metodo: methodName, resultado: result, error: null };
        }

        const result = handler.call(instance, ...parsed.values);
        return { clase: className, metodo: methodName, resultado: result, error: null };
    } catch (error) {
        return { clase: className, metodo: methodName, resultado: null, error: error.message };
    }
};

const serializeResponse = (response) => `${JSON.stringify(response)}\n`;

const handleDataMessage = (socket, rawMessage) => {
    let request;
    try {
        request = JSON.parse(rawMessage);
    } catch (error) {
        const response = { clase: null, metodo: null, resultado: null, error: 'JSON invalido' };
        socket.write(serializeResponse(response));
        return;
    }

    const response = executeRequest(request);
    console.log('Respuesta enviada al cliente:', response);
    socket.write(serializeResponse(response));
};

const startServer = (options) => {
    const server = net.createServer((socket) => {
        console.log(`Client connected from ${socket.remoteAddress}:${socket.remotePort}`);

        let buffer = '';

        socket.on('data', (chunk) => {
            buffer += chunk.toString();

            let boundary = buffer.indexOf('\n');
            while (boundary !== -1) {
                const rawMessage = buffer.slice(0, boundary).trim();
                buffer = buffer.slice(boundary + 1);

                if (rawMessage.length > 0) {
                    handleDataMessage(socket, rawMessage);
                }

                boundary = buffer.indexOf('\n');
            }
        });

        socket.on('error', (err) => {
            console.error(`Socket error: ${err.message}`);
        });

        socket.on('end', () => {
            console.log('Client disconnected');
        });
    });

    server.listen(options, () => {
        console.log(`Server listening on TCP://${options.host}:${options.port}`);
    });
};

const options = {
    port: 3000,
    host: '127.0.0.1'
};

startServer(options);