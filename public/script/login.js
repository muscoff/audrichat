const socket = io();
var private_id = null;
const error = document.querySelector('.error')

socket.on('connect', ()=>{
    private_id = socket.id
})

document.querySelector('form').addEventListener('submit', e=>{
    e.preventDefault();
    const username = e.target[0].value;
    if(username !== ''){
        socket.emit('set-username', {username});
    }else{
        error.innerText = 'Username cannot be empty';
        setTimeout(()=>{error.innerText = ''},3000)
    }
})

socket.on('login success', ({id, username})=>{
    localStorage.setItem('user-cred', JSON.stringify({id, username}))
    window.location.href = '/private'
})