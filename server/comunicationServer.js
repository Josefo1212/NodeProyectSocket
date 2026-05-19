// parte de luismi
// Convierte los bytes recibidos en un objeto de peticion
export const deserializarPeticion = (dataBuffer) => {
    // El servidor recibe bytes, los pasamos a objeto para Lau
    return JSON.parse(String(dataBuffer));
};

export const serializarRespuesta = (objetoRespuesta) => {
    // El resultado de Lau lo hacemos String para mandarlo por el cable
    return JSON.stringify(objetoRespuesta);
};