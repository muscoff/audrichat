var socket = io();
const title = document.querySelector('.title');
const titleHeight = title.offsetHeight;
const windowHeight = window.innerHeight;
const messages = document.querySelector('.messages');
const chatBot = document.querySelector('.chat-bot');
const chatBotHeight = chatBot.offsetHeight;
const height = windowHeight - (titleHeight + chatBotHeight);
messages.style.height = `${height}px`;

socket.on('connect', ()=>{
    //console.log('socket-id', socket.id)
})

document.querySelector('#message').addEventListener('keyup', e=>{
    let nickname = document.querySelector('form input.nickname').value;
    nickname = nickname !== '' ? nickname : 'unknown';
    if(e.target.value !== ''){
        socket.emit('typing', nickname);
    }else{
        socket.emit('stopped typing');
    }
})

document.querySelector('form').addEventListener('submit', e=>{
    e.preventDefault();

    let nickname = document.querySelector('form input.nickname').value;
    nickname = nickname !== '' ? nickname : 'unknown';
    const msg = e.target[1].value;

    if(msg !== ''){
        const div = document.createElement('div');
        div.className = 'sender';
        div.innerHTML = `
            <div class="chat">
                <div class="name">${nickname}</div>
                <div class="text-message">${msg}</div>
            </div>
        `;
        messages.appendChild(div);
        socket.emit('chat message', {msg, nickname})
        e.target[1].value = ''

        messages.scroll(0, messages.scrollHeight)
    }
})

socket.on('chat message', ({nickname, msg})=>{
    const div = document.createElement('div')
    div.className = 'receiver';
    div.innerHTML = `
        <div class="chat">
            <div class="name">${nickname}</div>
            <div class="text-message">${msg}</div>
        </div>
    `;
    messages.appendChild(div)
    //window.scrollTo(0, document.body.scrollHeight)
    messages.scroll(0, messages.scrollHeight)
})

socket.on('typing', (nickname)=>{
    document.querySelector('#typing').innerText = `${nickname} is typing...`
})

socket.on('stopped typing', ()=>{
    document.querySelector('#typing').innerText = ''
})