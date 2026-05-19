import readline from 'readline';

// Envuelve rl.question en una promesa para usar await
const askQuestion = (rl, question) => new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
});

// Intenta convertir a numero y devuelve null si no es valido
const parseNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

// Pide la operacion y la cantidad de valores al usuario
export const promptRequest = async (operations = []) => {
    const rl = readline.createInterface({
        // Usamos readline para pedir datos al usuario por consola
        input: process.stdin,
        output: process.stdout
    });

    // permite salir escribiendo "salir" como operacion
    try {
        // Si el servidor nos dio una lista de operaciones, la mostramos al usuario
        const operationsLabel = operations.length > 0
            ? `Operacion (${operations.join(', ')}): `
            : 'Operacion: ';
        const operacion = (await askQuestion(rl, operationsLabel)).trim();
        if (operacion.toLowerCase() === 'salir') {
            return { operacion };
        }
        let cantidad = null;
        while (cantidad === null || cantidad < 2) {
            const cantidadInput = await askQuestion(rl, 'Cantidad de parametros (minimo 2): ');
            const parsedCantidad = parseInt(cantidadInput, 10);
            cantidad = Number.isInteger(parsedCantidad) ? parsedCantidad : null;
        }

        const parametros = [];
        for (let i = 0; i < cantidad; i += 1) {
            const valueInput = await askQuestion(rl, `Valor ${i + 1}: `);
            parametros.push(parseNumber(valueInput));
        }

        return { operacion, parametros };
    } finally {
        rl.close();
    }
};
