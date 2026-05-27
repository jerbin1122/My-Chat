const http = require("http");
const fs = require("fs");
const PORT = process.env.PORT || 8000;

const FILE = "messages.json";

// create file if not exists
if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, "[]");
}

function readMsgs() {
    const data = fs.readFileSync(FILE, "utf8");
    return JSON.parse(data || "[]");
}

function saveMsgs(msgs) {
    fs.writeFileSync(FILE, JSON.stringify(msgs, null, 2));
}

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.end();
        return;
    }

    // GET messages
    if (req.method === "GET" && req.url === "/msgs") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(readMsgs()));
        return;
    }

    // SEND message
    if (req.method === "POST" && req.url === "/send") {
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            let msgs = readMsgs();
            msgs.push(body);

            saveMsgs(msgs);

            res.end("ok");
        });

        return;
    }

    // CLEAR messages
    if (req.method === "POST" && req.url === "/clear") {
        saveMsgs([]);
        res.end("cleared");
        return;
    }

    res.end("Server running");
});

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});