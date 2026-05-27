const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

const FILE = path.join(__dirname, "messages.json");

/* LOAD DATA */
function loadData(){

    try{

        return JSON.parse(fs.readFileSync(FILE, "utf8"));
    }
    catch(err){

        return {
            messages: [],
            users: {}
        };
    }
}

/* SAVE DATA */
function saveData(data){

    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/* DATA */
let data = loadData();

let messages = data.messages;

let users = data.users;

/* NEW FEATURE */
let onlineUsers = {};

/* FRONTEND */
app.get("/", (req,res)=>{

    res.sendFile(path.join(__dirname, "index.html"));
});

/* SOCKET */
io.on("connection", (socket)=>{

    console.log("User connected");

    /* SEND OLD MESSAGES */
    socket.emit("load messages", messages);

    /* RESTORE SAVED NAME */
    socket.on("get saved name", (userId)=>{

        /* SAVE USERID TO SOCKET */
        socket.userId = userId;

        if(users[userId]){

            socket.emit("saved name", users[userId]);

            /* USER ONLINE WHEN APP OPENS */
            onlineUsers[userId] = users[userId];

            io.emit(
                "users online",
                Object.values(onlineUsers)
            );
        }
    });

    /* SEND MESSAGE */
    socket.on("chat message", (dataMsg)=>{

        if(!dataMsg) return;

        if(!dataMsg.userId) return;

        if(!dataMsg.name) return;

        if(!dataMsg.msg) return;

        /* SAVE USER NAME */
        users[dataMsg.userId] = dataMsg.name;

        /* USER ONLINE */
        onlineUsers[dataMsg.userId] = dataMsg.name;

        const msgData = {
            name:dataMsg.name,
            msg:dataMsg.msg,
            time:Date.now()
        };

        /* SAVE MESSAGE */
        messages.push(msgData);

        saveData({
            messages:messages,
            users:users
        });

        /* SEND TO EVERYONE */
        io.emit("chat message", msgData);

        /* UPDATE ONLINE USERS */
        io.emit(
            "users online",
            Object.values(onlineUsers)
        );
    });

    /* CLEAR CHAT */
    socket.on("clear messages", ()=>{

        messages = [];

        saveData({
            messages:messages,
            users:users
        });

        io.emit("load messages", []);
    });

    /* DISCONNECT */
    socket.on("disconnect", ()=>{

        if(socket.userId){

            delete onlineUsers[socket.userId];

            io.emit(
                "users online",
                Object.values(onlineUsers)
            );
        }

        console.log("User disconnected");
    });
});

server.listen(3000, ()=>{

    console.log("Server running on http://localhost:3000");
});