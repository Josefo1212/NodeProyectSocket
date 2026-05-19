// parte de luismi
export const serializeRequest = (objetoPeticion) => {
    // Convertimos el objeto de Lau a un String JSON para el socket
    return `${JSON.stringify(objetoPeticion)}\n`;
};

export const deserializeResponse = (dataBuffer) => {
    // Convertimos los bytes que llegan del servidor a un objeto JS
    return JSON.parse(String(dataBuffer));
};