const express= require('express')
const http = require('http');
const app = express();
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);

app.use(express.json());

let users = [];
let userName;

app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/index.html');
})

app.post('/', (req,res)=>{
    userName = req.body.userName;
    let result = users.find((user)=> user.peopleName===userName);

    if(result || !userName){
        res.status(401).json({
            success: false,
            info: 'Already Present'
        })
        return;
    }

    console.log(users.length);
    users[users.length-1].peopleName = userName;
    io.emit('group message', {
        name: userName,
        info: 'Joined'
    })

    res.status(201).json({
        success: true,
        info: 'successfully posted'
    })
})

app.get('/api/data', (req,res)=>{
    res.json({
        success: true,
        info: users
    })
})

io.on('connection', (socket)=>{
    console.log('a user connected');
    socket.on('disconnect', ()=>{
        removeUser(socket.id);
        console.log('user disconnected');
    })
    socket.on('owner message', (msg)=>{
        socket.emit('owner message', msg);
    })
    socket.on('private message', (msg)=>{
        socket.broadcast.to(msg.user).emit('private message', {
            name: getName(msg.user),
            info: msg.message
        })
    })
    socket.on('group message', (msg)=>{
        io.emit('group message', {
            name: getName(socket.id),
            info: msg
        })
    })
    users.push({
        peopleName: '',
        id: socket.id
    })
})

function getName(givenId) {
    let name='hi';
    users.forEach(e=>{
        console.log(e.peopleName);
        if((e.id)===givenId){
            name =  e.peopleName;
        }
    })
    return name;
}

function removeUser(givenId){
    users = users.filter((e)=>{
        return e.id !== givenId;
    })
}


server.listen(3000, ()=>{
    console.log('Server is listening on port : 3000');
})


