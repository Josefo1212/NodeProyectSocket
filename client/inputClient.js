import readline from 'readline';

let menuItems = [];

const createInterface = () => readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (rl, question) => new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
});

const buildMenu = (catalog) => {
    menuItems = [];
    (catalog ?? []).forEach((classRecord) => {
        const className = classRecord.name;
        const methods = Array.isArray(classRecord.methods) ? classRecord.methods : [];
        methods.forEach((method) => {
            menuItems.push({ clase: className, metodo: method });
        });
    });
};

const printMenu = () => {
    console.log('Menu:');
    menuItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.clase} -> ${item.metodo}`);
    });
    console.log('0. Salir');
};

const parseParametros = (input) => input
    .split(' ')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

export const promptRequest = async () => {
    if (menuItems.length === 0) {
        console.log('Catalogo vacio.');
        return { salir: true };
    }

    const rl = createInterface();
    try {
        while (true) {
            printMenu();
            const choiceInput = await askQuestion(rl, 'Selecciona una opcion: ');
            const choice = Number.parseInt(choiceInput, 10);

            if (Number.isNaN(choice) || choice < 0 || choice > menuItems.length) {
                console.log('Opcion invalida.');
                continue;
            }

            if (choice === 0) {
                return { salir: true };
            }

            const selected = menuItems[choice - 1];
            const paramsInput = await askQuestion(rl, 'Parametros (separados por espacios): ');
            const parametros = parseParametros(paramsInput);

            return { clase: selected.clase, metodo: selected.metodo, parametros };
        }
    } finally {
        rl.close();
    }
};

export { buildMenu };
