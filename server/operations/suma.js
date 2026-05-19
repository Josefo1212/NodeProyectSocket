export const id = 'suma';
export const aliases = ['+'];
export const message = 'Operacion suma realizada con exito';

export const execute = (parametros) => parametros.reduce((acc, value) => acc + value, 0);