import net from 'net'

const options = {
    port: 3000,
    host: 'localhost'
}

const server = net.createServer((socket) => {
    console.log('Client connected')

    socket.on('error', (err)=>{
        console.error(`Error: ${err}`)
    })

    socket.on('end', ()=>{
        console.log('Client disconnected')
    })
})

server.on('error', (err) => {
    console.error(`Server error: ${err}`)
})

server.listen(options, () => {
    console.log(`Server listening on host: ${options.host} and port: ${options.port}`)
})