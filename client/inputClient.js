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

// Pide la operacion y los dos valores al usuario
export const promptRequest = async (operations = []) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // permite salir escribiendo "salir" como operacion
    try {
        const operationsLabel = operations.length > 0
            ? `Operacion (${operations.join(', ')}): `
            : 'Operacion: ';
        const operacion = (await askQuestion(rl, operationsLabel)).trim();
        if (operacion.toLowerCase() === 'salir') {
            return { operacion };
        }
        const aInput = await askQuestion(rl, 'Valor A: ');
        const bInput = await askQuestion(rl, 'Valor B: ');
        
        const a = parseNumber(aInput);
        const b = parseNumber(bInput);

        return { operacion, a, b };
    } finally {
        rl.close();
    }
};
