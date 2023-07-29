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

    users[users.length-1].peopleName = userName;

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
        console.log('user disconnected');
    })
    socket.on('owner message', (msg)=>{
        console.log('message', msg);
        socket.emit('owner message', msg);
    })
    socket.on('private message', (msg)=>{
        socket.broadcast.to(msg.user).emit('private message', {
            name: getName(msg.user),
            info: msg.message
        })
    })
    users.push({
        peopleName: '',
        id: socket.id
    })
})

function getName(id) {
    users.forEach(e=>{
        if(e.id===id){
            return e.peopleName;
        }
    })
}


server.listen(3000, ()=>{
    console.log('Server is listening on port : 3000');
})


