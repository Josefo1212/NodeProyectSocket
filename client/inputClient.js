import readline from 'readline';

const askQuestion = (rl, question) => new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
});

const parseNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export const promptRequest = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        const operacion = (await askQuestion(rl, 'Operacion (suma, resta, multiplicacion, division): ')).trim();
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
