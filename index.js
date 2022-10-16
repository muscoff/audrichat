const http = require('http');
const path = require('path');
const express = require('express');
const app = express();
const server = http.createServer(app);
const {engine} = require('express-handlebars')
const {users, userJoin, updateId, removeUser} = require('./users')

const {Server} = require('socket.io')
const io = new Server(server)

const port = process.env.PORT || 3000;

// Establish Handlebars
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './views')

// Static files
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res)=>{
    res.render('home', {title: "Socket io Chat-app"});
});

app.get('/login', (req, res)=>{
    res.render('login');
});

app.get('/private', (req, res)=>{
    res.render('private', {title: "Private Chat"});
});

io.on('connection',async(socket)=>{
    console.log('a user connected');
    // const c = io.engine.clientsCount;
    // console.log('connected clients', c);
    // console.log('socket-id',socket.id);

    // const userId = Math.floor((Math.random() * 1000000) + 1)
    // socket.data.userId = userId;

    // const sockets = await io.fetchSockets();
    // for(const s of sockets){
    //     console.log('id',s.id)
    //     console.log('data',s.data)
    // }

    socket.on('user login', ()=>{
        io.emit('user login');
    })

    socket.on('set-username', ({username})=>{
        socket.data.id = socket.id; 
        socket.data.username = username;

        // socket.join('chat')
        userJoin({id: socket.id, username})

        socket.emit('login success', {id: socket.id, username})
    })

    socket.on('connected users', ({username, id})=>{
        updateId({id, username})
        io.emit('connected users', users);
    })

    socket.on('user-typing', ({receiver, nickname})=>{
        socket.to(receiver).emit('user-typing', nickname);
        //console.log('receiver', receiver, 'nickname', nickname)
    })

    socket.on('user-stopped-typing', ({receiver})=>{
        socket.to(receiver).emit('user-stopped-typing')
    })

    socket.on('private message', ({receiver, sender, nickname, msg})=>{
        socket.to(receiver).emit('private message', {nickname, sender, msg})
    })

    socket.on('chat message', (obj)=>{
        // io.emit('chat message', msg);
        socket.broadcast.emit('chat message', obj)
    })

    socket.on('typing', (nickname)=>{
        // io.emit('typing', nickname);
        socket.broadcast.emit('typing', nickname);
    })

    socket.on('stopped typing', ()=>{
        io.emit('stopped typing');
    })

    socket.on('disconnect', ()=>{
        if(socket.request.headers.referer === `http://${socket.request.headers.host}/private`){
            removeUser(socket.id)
            io.emit('connected users', users);
        }
    })
});

server.listen(port, ()=>console.log(`Running at localhost:${port}`))