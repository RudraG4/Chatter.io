import express from "express"
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from "url"
import path from "path"
import dotenv from 'dotenv'

dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.static(path.join(__dirname, 'public')));

const server = createServer(app);
const io = new Server(server);

app.get('/', (request, response) => {
    response.sendFile(path.resolve(__dirname, 'index.html'))
})

const userDB = new Map();

const refreshChatList = (socket) => {
    const userList = Array.from(userDB, ([username, id]) => ({ username, id }))
    socket.emit('chatlist-refresh', userList);
    console.log('Refreshing Server...' + JSON.stringify(userList));
}

io.on('connection', (socket) => {
    // refreshChatList(socket)

    socket.on('user-connected', (userinfo) => {
        userDB.set(userinfo.username, userinfo.id);
        console.log(userDB);
        refreshChatList(socket);
    })

    socket.on('send-chat-message', (data) => {
        if (data.recipient) {
            socket.to(data.recipient).emit('chat-message', data)
        } else {
            socket.broadcast.emit('chat-message', data)
        }
    })

    socket.on('disconnect', () => {
        console.log('Disconnected...' + socket.id)
        const disconnectedUsers = [...userDB.entries()].filter(entry => entry[1] == socket.id)
        if (disconnectedUsers.length) {
            disconnectedUsers.map(user => userDB.delete(user[0]))
        }
        refreshChatList(socket)
    })
})

server.listen(3000, () => console.log('Listening on port [:3000]'))