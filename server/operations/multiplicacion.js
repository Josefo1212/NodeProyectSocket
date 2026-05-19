export const id = 'multiplicacion';
export const aliases = ['*'];
export const message = 'Operacion multiplicacion realizada con exito';

export const execute = (parametros) => parametros.reduce((acc, value) => acc * value, 1);