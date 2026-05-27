const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const FILE = path.join(__dirname, "messages.json");

// Load messages
function loadMessages() {
    try {
        return JSON.parse(fs.readFileSync(FILE, "utf8"));
    } catch (err) {
        return [];
    }
}

// Save messages
function saveMessages(messages) {
    fs.writeFileSync(FILE, JSON.stringify(messages, null, 2));
}

let messages = loadMessages();

// Serve frontend
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
    console.log("User connected");

    // send old messages
    socket.emit("load messages", messages);

    // new message
    socket.on("chat message", (data) => {

        if (!data || !data.name || !data.msg) return;

        const msgData = {
            name: data.name,
            msg: data.msg,
            time: Date.now()
        };

        messages.push(msgData);
        saveMessages(messages);

        io.emit("chat message", msgData);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});