import net from 'net'
import readline from 'readline'
import { serializarPeticion, deserializarRespuesta } from './comunicationClient.js'

const options = {
    port: 3000,
    host: 'localhost'
}

const askQuestion = (rl, question) => new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer))
})

const parseNumber = (value) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

const promptRequest = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    try {
        const operacion = (await askQuestion(rl, 'Operacion (suma, resta, multiplicacion, division): ')).trim()
        const aInput = await askQuestion(rl, 'Valor A: ')
        const bInput = await askQuestion(rl, 'Valor B: ')

        const a = parseNumber(aInput)
        const b = parseNumber(bInput)

        return { operacion, a, b }
    } finally {
        rl.close()
    }
}

const formatResponse = (response) => {
    if (!response || typeof response !== 'object') {
        return 'Respuesta invalida'
    }

    if (response.error) {
        return `Operacion: ${response.operacion ?? 'N/A'} | Error: ${response.error}`
    }

    return `Operacion: ${response.operacion ?? 'N/A'} | Resultado: ${response.resultado}`
}

const client = net.createConnection(options, async () => {
    console.log('Connected to server')

    const request = await promptRequest()
    client.write(serializarPeticion(request))
})

client.on('data', (data) => {
    let response
    try {
        response = deserializarRespuesta(data)
    } catch (error) {
        console.error('No se pudo leer la respuesta del servidor')
        client.end()
        return
    }

    console.log(formatResponse(response))
    client.end()
})

client.on('error', (err) => {
    console.error(`Client error: ${err}`)
})

client.on('end', () => {
    console.log('Disconnected from server')
})