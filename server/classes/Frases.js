export const className = 'Frases';

export default class Frases {
    crearFrase(...words) {
        return words.join(' ');
    }
}
