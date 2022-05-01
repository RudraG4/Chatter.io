const socket = io();
const sendBtn = document.querySelector('#send-btn')
const username = prompt('Username?')

if (username) {
    socket.on('connect', () => {
        const user = document.querySelector('.banner_right .user_name')
        user.textContent = username + " " + socket.id
        const messagecontainer = document.querySelector('#message-container')
        messagecontainer.innerHTML = "";
        socket.emit('user-connected', { username, id: socket.id })
    });

    socket.on('chat-message', (message) => {
        addMessage(message, 'left')
    });

    socket.on('chatlist-refresh', (data) => {
        refreshChatList(data)
    });
}

sendBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const messageInput = document.querySelector('#message-input')
    const recipientInput = document.querySelector('#recipient-input')
    if (messageInput.value && recipientInput.value) {
        var sent_at = new Date()
        sent_at = `${sent_at.getUTCHours()}:${sent_at.getUTCMinutes()}`
        const data = { message: messageInput.value, sent_at, sender: socket.id, recipient: recipientInput.value }
        addMessage(data)
        socket.emit('send-chat-message', data)
        messageInput.value = ""
    }
})

const addMessage = (data, direction = 'right') => {
    const messagepop = document.createElement('div')
    const messagepopwrapper = document.createElement('div')
    const messagedetails = document.createElement('div')
    const messagecontent = document.createElement('div')

    messagedetails.textContent = data.sent_at;
    messagecontent.textContent = data.message;

    if (direction == 'right') {
        messagepopwrapper.classList.add('flex-right');
    } else {
        messagepopwrapper.classList.add('flex-left');
    }
    messagepopwrapper.classList.add('message-pop-wrapper');
    messagedetails.classList.add('message-details');
    messagecontent.classList.add('message');
    messagepop.classList.add('message-pop');

    messagepopwrapper.append(messagedetails, messagecontent);
    messagepop.append(messagepopwrapper);

    const messagecontainer = document.querySelector('#message-container');
    messagecontainer.append(messagepop);
}

const refreshChatList = (data) => {
    console.log('Refreshing Client...' + JSON.stringify(data))
    const contacts = document.querySelector('#contacts')
    contacts.innerHTML = ""
    data && data.forEach(user => {
        if (user.username != username) {
            const li = document.createElement('li')
            const image = document.createElement('a')
            const contactinfo = document.createElement('div')
            const contactwrapper = document.createElement('div')

            contactinfo.dataset.uid = user.id
            contactinfo.textContent = user.username

            image.classList.add('user_avatar')
            contactinfo.classList.add('user_name')
            contactwrapper.classList.add('contactwrapper')

            contactinfo.addEventListener('click', displayChatWindow, true)

            contactwrapper.append(image, contactinfo)
            li.append(contactwrapper)

            contacts.append(li)
        }
    })
    displayChatWindow()
}

const displayChatWindow = (event) => {
    const chatboxusername = document.querySelector('#chatbox-header .user_name')
    const messagecontainer = document.querySelector('#message-container')
    const recipient = document.querySelector('#recipient-input')
    const mask = document.querySelector('#mask')
    var maskStyle = 'flex';
    var maskContent = 'Chatter.io, an online chat application. Connect with your friends and other active users.';
    if (event && event.target.className == 'user_name') {
        const active = document.querySelector('#contacts .active');
        active && active.classList.remove('active');
        chatboxusername.textContent = event.target.textContent;
        recipient.value = event.target.dataset.uid;
        messagecontainer.innerHTML = "";
        event.target.parentNode.classList.add('active');
        maskStyle = "none";
    } else {
        const contactList = document.querySelectorAll('#contacts li');
        const selecteduser = document.querySelector('#contacts .active .user_name');
        if (contactList.length) {
            if (selecteduser) {
                chatboxusername.textContent = selecteduser.textContent;
                recipient.value = selecteduser.dataset.uid;
                messagecontainer.innerHTML = "";
            }
        }
    }
    mask.style.display = maskStyle;
    mask.textContent = maskContent;
}