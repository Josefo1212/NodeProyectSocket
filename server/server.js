import net from 'net'

const options = {
    port: 3000,
    host: 'localhost'
}

class Calculator {
    add(a, b) {
        return a + b
    }

    subtract(a, b) {
        return a - b
    }

    multiply(a, b) {
        return a * b
    }

    divide(a, b) {
        if (b === 0) {
            throw new Error('Division entre cero')
        }

        return a / b
    }
}

const calculator = new Calculator()

const normalizeOperation = (operation) => {
    if (!operation) {
        return null
    }

    const value = String(operation).trim().toLowerCase()

    if (value === 'suma' || value === '+') return 'suma'
    if (value === 'resta' || value === '-') return 'resta'
    if (value === 'multiplicacion' || value === '*') return 'multiplicacion'
    if (value === 'division' || value === '/') return 'division'

    return null
}

const toNumber = (value) => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : null
    }

    return null
}

const executeOperation = (request) => {
    const operation = normalizeOperation(request?.operacion)
    const a = toNumber(request?.a)
    const b = toNumber(request?.b)

    if (!operation) {
        return { operacion: request?.operacion ?? null, resultado: null, error: 'Operacion invalida' }
    }

    if (a === null || b === null) {
        return { operacion: operation, resultado: null, error: 'Valores invalidos' }
    }

    try {
        let result
        if (operation === 'suma') result = calculator.add(a, b)
        if (operation === 'resta') result = calculator.subtract(a, b)
        if (operation === 'multiplicacion') result = calculator.multiply(a, b)
        if (operation === 'division') result = calculator.divide(a, b)

        return { operacion: operation, resultado: result, error: null }
    } catch (error) {
        return { operacion: operation, resultado: null, error: error.message }
    }
}

const server = net.createServer((socket) => {
    console.log('Client connected')

    socket.on('data', (data) => {
        let request
        try {
            request = JSON.parse(String(data))
        } catch (error) {
            const response = { operacion: null, resultado: null, error: 'JSON invalido' }
            socket.write(JSON.stringify(response))
            return
        }

        const response = executeOperation(request)
        socket.write(JSON.stringify(response))
    })

    socket.on('error', (err)=>{
        console.error(`Error: ${err}`)
    })

    socket.on('end', ()=>{
        console.log('Client disconnected')
    })
})




server.listen(options, () => {
    console.log(`Server listening on host: ${options.host} and port: ${options.port}`)
})