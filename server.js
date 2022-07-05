const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, { debug: true });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:roomId", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log('join-room')
    socket.join(roomId);
    // socket.to(roomId).broadcast.emit("user-connected",userId)
    io.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) => {
      console.log('message call')
      io.to(roomId).emit("create-message", message);
    });
  });
});

server.listen(3030);
