import net from 'net'

const options = {
    port: 3000,
    host: 'localhost'
}

const client = net.createConnection(options, () => {
    console.log('Connected to server')
    client.write('Hello, Server!')
})

client.on('error', (err) => {
    console.error(`Client error: ${err}`)
})

client.on('end', () => {
    console.log('Disconnected from server')
})