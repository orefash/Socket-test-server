const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors")

app.use(cors());
app.use(express.json());

const cMap = new Map();

let uMap = new Map([
    ["John", {
        name: "John Stamos",
        age: 20,
        text: "The first data in the set"
    }],
    ["Sarah", {
        name: "Sarah Waters",
        age: 30,
        text: "The second data in the set"
    }],
    // [peter, 'subscriber']
]);

// let userRoles = new Map();

let clients = [];

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const genKey = (l) => {
    return Array(l).fill().map(()=>((Math.random()*36)|0).toString(36)).join('')
}

io.on("connection", (socket) => {
console.log(`User connected: ${socket.id}`)

    cMap.set(socket.id, {
        id: socket.id,
        key: genKey(4),
        user: null
    })

    // socket.to(socket.id).emit("new_key", cMap.get(socket.id));

    console.log("On new connect Users: ", cMap)

    socket.on("disconnect", () => {
        // clients = clients.filter(data => data.id != socket.id);
        cMap.delete(socket.id)
        console.log("On disconnect Users: ", cMap)
    });

    socket.on("join_room", (data) => {
        socket.join(data)
    })

    socket.on("send_message", (data) => {
        // console.log(`recevied: ${JSON.stringify(data)}`)
        socket.to(data.room).emit("receive_msg", data);
    });
});

app.post('/message', (req, res) => {
    // messages.push(req.body);
    console.log("in message: ", req.body)
    const udata = cMap.get(req.body.sid);
    if (udata) {
        
        io.emit('new_key', {...udata, sid: req.body.sid});
        res.status(200).json({message: "connected"});
    }
    
    // io.emit('new_key', "keyvalue");
    res.status(400);
});


app.post('/login', (req, res) => {
    // messages.push(req.body);
    console.log("in login: ", req.body)

    let valid = false;

    const user = uMap.get(req.body.uname);

    if (user){
        res.status(200).json({user});
    }

    res.status(400);
});


app.post('/validate-key', (req, res) => {
    // messages.push(req.body);
    console.log("in validate key: ", req.body)

    let valid = false, user = null, username = req.body?.user;
    
    for (const [key, value] of cMap) {
        // console.log(key, value); // 👉️ country Chile, age 30
        if(value.key === req.body.key){
            // console.log("FOund: ", value)
            user = value
            value.user = req.body.user;
            valid = true;
            // console.log("User name: ", username) 
            cMap.set(key, value)
            // console.log("Updated: ", cMap)
            // console.log("user obj: ", uMap)
            // console.log("user req: ", req.body.user)
            if(uMap.get(req.body.user)){
                var uj = uMap.get(req.body.user);
                var uobj = {...uj, username, key}
                console.log("user connect: ", uobj)
                io.emit('screen_conn', {
                    uobj
                });
            }
            
            break;
        }
        
    }

    if(valid){
        res.status(200).json({user});
    }

      
      
    // const udata = cMap.get(req.body.sid);
    // if (udata) {
        
    //     io.emit('new_key', udata);
    //     res.status(200).json({message: "connected"});
    // }
    
    // io.emit('new_key', "keyvalue");
    res.status(400);
});

server.listen(port = 3001, () => {
    console.log("Server is running on port "+port)
});