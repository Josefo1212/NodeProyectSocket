// parte de luismi
// Convierte los bytes recibidos en un objeto de peticion
export const deserializeRequest = (dataBuffer) => {
    // El servidor recibe bytes, los pasamos a objeto para Lau
    return JSON.parse(String(dataBuffer));
};

export const serializeResponse = (objetoRespuesta) => {
    // El resultado de Lau lo hacemos String para mandarlo por el cable
    return JSON.stringify(objetoRespuesta);
};