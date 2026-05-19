export const id = 'division';
export const aliases = ['/'];
export const message = 'Operacion division realizada con exito';

export const execute = (parametros) => {
    const [first, ...rest] = parametros;
    return rest.reduce((acc, value) => {
        if (value === 0) {
            throw new Error('Division entre cero');
        }
        return acc / value;
    }, first);
};
