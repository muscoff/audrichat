const socket = io();
var private_id = null;
var userArray;
const userContainer = document.querySelector('#user-list')
const siderUserContainer = document.querySelector('#side-user-list')
const message = document.querySelector('#message');
const recepient = document.querySelector('#receiver');
const userNickname = document.querySelector('#nickname');
const messageBoard = document.querySelector('.message-board');
const userBar = document.querySelector('.user-side-bar');

setChatBoard = () => {
    const windowHeight = window.innerHeight;

    const chatHeading = document.querySelector('.chat-heading');
    const chatHeadingHeight = chatHeading.offsetHeight;
    const br = document.querySelector('#break');
    br.style.height = chatHeadingHeight + 'px';

    const textInput = document.querySelector('#text-input');
    const textInputHeight = textInput.offsetHeight;

    const sub = chatHeadingHeight + textInputHeight + 8;
    const diff = windowHeight - sub;
    // messageBoard.style.height = diff + 'px';
    
    setTimeout(() =>{setChatBoard()},)
}
setChatBoard();

socket.on('connect', ()=>{
    private_id = socket.id
    let user_cred = localStorage.getItem('user-cred');
    user_cred = user_cred ? JSON.parse(user_cred) : null;
    if(user_cred !== null){
        if(user_cred.hasOwnProperty('username') & user_cred.username !== ''){
            user_cred.id = private_id
            document.querySelector('#sender').value = private_id
            userNickname.value = user_cred.username
            localStorage.setItem('user-cred', JSON.stringify(user_cred))

            socket.emit('connected users', {username: user_cred.username, id: private_id})
        }else{
            socket.emit('user login');
        }
    }else{
        socket.emit('user login');
    }
})

socket.on('user login', ()=>{
    window.location.href = '/login'
});

socket.on('connected users', (users)=>{
    userArray = users.filter(item=>item.id !== private_id);
    let string = '';
    if(userArray.length > 0){
        userArray.forEach(({username, id})=>{
            string+=`
                    <p data-id="${id}" data-username="${username}">${username}</p>
                `;
        })
    }
    userContainer.innerHTML = string;
    siderUserContainer.innerHTML = string;

    document.querySelectorAll('.user-list p').forEach(element=>{
        element.addEventListener('click', e=>{
            document.querySelectorAll('.user-list p').forEach(item=>item.style.color='white');
            element.style.color = 'green';
            let receiver = element.getAttribute('data-id');
            recepient.value = receiver
            let found = false;
            let foundIndex = null;

            if(messageBoard.querySelector('.message-card')){
                messageBoard.querySelectorAll('.message-card').forEach((element, index)=>{
                    element.classList.remove('z-index-1');
                    element.style.visibility = 'hidden';
                    if(element.getAttribute('data-id') === receiver){
                        found = true;
                        foundIndex = index;
                    }
                })
                if(found){
                    messageBoard.querySelectorAll('.message-card')[foundIndex].classList.add('z-index-1')
                    messageBoard.querySelectorAll('.message-card')[foundIndex].style.visibility = 'visible';
                }else{
                    const messageCard = document.createElement('div');
                    messageCard.className = 'message-card full white-bg1 overflow-auto absolute z-index-1'
                    messageCard.setAttribute('data-id', receiver);
                    messageCard.style.visibility = 'visible'

                    messageBoard.appendChild(messageCard);
                }
            }else{
                const messageCard = document.createElement('div');
                messageCard.style.visibility = 'visible'
                messageCard.className = 'message-card full white-bg1 overflow-auto absolute z-index-1'
                messageCard.setAttribute('data-id', receiver);

                messageBoard.appendChild(messageCard);
            }
        })
    })
})

message.addEventListener('keyup', e=>{
    let receiver = recepient.value;
    let nickname = userNickname.value;
    if(receiver !== ''){
        if(message.value !== ''){
            socket.emit('user-typing', {receiver, nickname})
        }else{
            socket.emit('user-stopped-typing', {receiver})
        }
    }
});

socket.on('user-typing', (nickname)=>{
    document.querySelector('#typing').innerHTML = `${nickname} is typing...`;
})

socket.on('user-stopped-typing', ()=>{
    document.querySelector('#typing').innerHTML = '';
})

openBar = () => {
    if(userBar.classList.contains('open')){
        userBar.classList.add('close');
        userBar.classList.remove('open');
    }else{
        userBar.classList.add('open');
        userBar.classList.remove('close');
    }
}

document.querySelector('form').addEventListener('submit', e=>{
    e.preventDefault()
    let sender = document.querySelector('#sender').value;
    let receiver = recepient.value;
    let nickname = userNickname.value;
    let msg = message.value;
    let foundIndex = null;

    if(msg !== '' & receiver !== '' & nickname !== ''){
        if(messageBoard.querySelector('.message-card')){
            messageBoard.querySelectorAll('.message-card').forEach((element, index)=>{
                if(element.getAttribute('data-id') === receiver){
                    foundIndex = index;
                }
            })
            let div = document.createElement('div')
            div.className = 'sender'
            div.innerHTML = `
                <div class="chat">
                    <div class="name">${nickname}  <span style="visibility: hidden;">${new Date().toLocaleTimeString()}</span></div>
                    <div class="text-message">${msg}</div>
                    <div class="name right-text">${new Date().toLocaleTimeString()}</div>
                </div>
            `;
            let card = messageBoard.querySelectorAll('.message-card')[foundIndex];
            card.style.visibility = 'visible'
            card.appendChild(div);
            card.scrollTop = card.scrollHeight;
        }
        socket.emit('private message', {receiver, sender, nickname, msg});
        message.value = ''
    }
})

socket.on('private message', ({nickname, sender, msg})=>{
    let found = false;
    let foundIndex = null;
    recepient.value = sender;
    if(messageBoard.querySelector('.message-card')){
        messageBoard.querySelectorAll('.message-card').forEach((element, index)=>{
            element.classList.remove('z-index-1');
            if(element.getAttribute('data-id') === sender){
                found = true;
                foundIndex = index;
            }
        })

        if(found){
            let div = document.createElement('div')
            div.className = 'receiver'
            div.innerHTML = `
                <div class="chat">
                    <div class="name">${nickname} <span style="visibility: hidden">${new Date().toLocaleTimeString()}</span></div>
                    <div class="text-message">${msg}</div>
                    <div class="name right-text">${new Date().toLocaleTimeString()}</div>
                </div>
            `;
            let card = messageBoard.querySelectorAll('.message-card')[foundIndex]
            card.style.visibility = 'visible'
            card.classList.add('z-index-1')
            card.appendChild(div)
            card.scrollTop = card.scrollHeight
        }else{
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card full white-bg1 overflow-auto absolute z-index-1'
            messageCard.setAttribute('data-id', sender);
            messageCard.style.visibility = 'visible'

            let div = document.createElement('div');
            div.className = 'receiver'
            div.innerHTML = `
                <div class="chat">
                    <div class="name">${nickname} <span class="visibility: hidden">${new Date().toLocaleTimeString()}</span></div>
                    <div class="text-message">${msg}</div>
                    <div class="name right-text">${new Date().toLocaleTimeString()}</div>
                </div>
            `;
            messageCard.appendChild(div)
            messageBoard.appendChild(messageCard)
        }
    }else{
        const messageCard = document.createElement('div');
        messageCard.className = 'message-card full white-bg1 overflow-auto absolute z-index-1'
        messageCard.setAttribute('data-id', sender);
        messageCard.style.visibility = 'visible'

        let div = document.createElement('div');
        div.className = 'receiver'
        div.innerHTML = `
            <div class="chat">
                <div class="name">${nickname} <span>${new Date().toLocaleTimeString()}</span></div>
                <div class="text-message">${msg}</div>
                <div class="right-text name">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        messageCard.appendChild(div)
        messageBoard.appendChild(messageCard)
    }
    console.log('nickname', nickname, 'message', msg);
})