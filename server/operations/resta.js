export const id = 'resta';
export const aliases = ['-'];
export const message = 'Operacion resta realizada con exito';

export const execute = (parametros) => {
	const [first, ...rest] = parametros;
	return rest.reduce((acc, value) => acc - value, first);
};