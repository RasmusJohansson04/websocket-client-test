// import { io } from "socket.io-client"

let socket
const loginForm = document.getElementById('login-form')
const usernameInput = document.getElementById('username-input')
const passwordInput = document.getElementById('password-input')

const roomForm = document.getElementById('room-form')
const roomRoomInput = document.getElementById('room-room-input')

const messagesList = document.getElementById('messages')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')
const roomInput = document.getElementById('room-input')

const inviteForm = document.getElementById('invite-form')
const userInput = document.getElementById('user-input')
const lobbyInput = document.getElementById('lobby-input')

let token

loginForm.addEventListener('submit', (e) => {
    e.preventDefault()
    if (usernameInput.value && passwordInput.value) {
        const header = btoa(usernameInput.value + ':' + passwordInput.value)
        axios.post('http://localhost:8080/login', {}, {
            headers: {
                'Authorization': 'Basic ' + header
            }
        }).then((res) => {
            console.log(res.data)
            token = res.data
            connect()
        }).catch((error) => {
            console.log(error);
        })
    }
})

inviteForm.addEventListener('submit', (e) => {
    e.preventDefault()
    if (userInput.value && lobbyInput.value) {
        console.log(userInput.value, lobbyInput.value)
        socket.emit('invite', { 'lobby': lobbyInput.value, 'username': userInput.value })
    }
})

const connect = () => {
    socket = io('ws://localhost:8080', {
        extraHeaders: {
            authorization: 'bearer ' + token
        }
    })
    socket.on('connect', () => {
        console.log('Hello')
    })

    socket.on('chat', (msg) => {
        console.log(msg)
        const item = document.createElement('li')
        item.textContent = msg
        messagesList.appendChild(item)
    })

    socket.on('invited', (data) => {
        const { lobby, username } = data
        const item = document.createElement('li')
        item.textContent = username + ' has invited you to ' + lobby
        messagesList.appendChild(item)
        const accept = document.createElement('button')
        accept.textContent = 'Accept'
        accept.onclick = () => {
            socket.emit('join', lobby)
        }
        item.appendChild(accept)
    })
}

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (messageInput.value) {
        await socket.emit('room', roomInput.value)
        socket.emit('chat', { 'message': messageInput.value, 'room': roomInput.value })
        messageInput.value = ''
    }
})

roomForm.addEventListener('submit', (e) => {
    e.preventDefault()
    socket.emit('room', roomRoomInput.value)
})