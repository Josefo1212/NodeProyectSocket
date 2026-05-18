// parte de luismi
export const serializarPeticion = (objetoPeticion) => {
    // Convertimos el objeto de Lau a un String JSON para el socket
    return JSON.stringify(objetoPeticion);
};

export const deserializarRespuesta = (dataBuffer) => {
    // Convertimos los bytes que llegan del servidor a un objeto JS
    return JSON.parse(String(dataBuffer));
};