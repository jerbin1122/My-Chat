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
function loadData() {
    try {
        return JSON.parse(fs.readFileSync(FILE, "utf8"));
    } catch (err) {
        return { messages: [], users: {} };
    }
}

/* SAVE DATA */
function saveData(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

let data = loadData();
let messages = data.messages;
let users = data.users;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
    console.log("User connected");

    // send chat history
    socket.emit("load messages", messages);

    // send online users
    io.emit("users online", Object.values(users));

    socket.on("chat message", (dataMsg) => {

        if (!dataMsg || !dataMsg.name || !dataMsg.msg) return;

        // SAVE USER ON SERVER (NO LOCALSTORAGE)
        users[socket.id] = dataMsg.name;

        const msgData = {
            name: dataMsg.name,
            msg: dataMsg.msg,
            time: Date.now()
        };

        messages.push(msgData);

        saveData({ messages, users });

        io.emit("chat message", msgData);
        io.emit("users online", Object.values(users));
    });

    socket.on("clear messages", () => {
        messages = [];
        saveData({ messages, users });
        io.emit("load messages", []);
    });

    socket.on("disconnect", () => {
        delete users[socket.id];

        saveData({ messages, users });

        io.emit("users online", Object.values(users));

        console.log("User disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});