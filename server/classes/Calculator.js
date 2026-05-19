export const className = 'Calculator';

export default class Calculator {
    suma(a, b) {
        return a + b;
    }

    resta(a, b) {
        return a - b;
    }

    multiplicacion(a, b) {
        return a * b;
    }

    division(a, b) {
        if (b === 0) {
            throw new Error('Division entre cero');
        }
        return a / b;
    }
}
