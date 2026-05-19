class Calculator {
    add(a, b) {
        return a + b;
    }

    subtract(a, b) {
        return a - b;
    }

    multiply(a, b) {
        return a * b;
    }
    // Divide dos valores y evita dividir entre cero
    divide(a, b) {
        if (b === 0) {
            throw new Error('Division entre cero');
        }
        return a / b;
    }
}

export default Calculator;
