export const id = 'division';
export const aliases = ['/'];
export const message = 'Operacion division realizada con exito';

export const execute = (a, b) => {
    if (b === 0) {
        throw new Error('Division entre cero');
    }
    return a/b;
};
