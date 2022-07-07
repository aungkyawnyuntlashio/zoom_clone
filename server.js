const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);

const { ExpressPeerServer } = require("peer");

const customGenerationFuction = () =>
  (Math.random().toString(36) + "0000000000000000000").substr(2, 16);

const peerServer = ExpressPeerServer(server, {
  debug: true,
  generateClientId: customGenerationFuction,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  // res.redirect(`/${uuidv4()}`);
  res.status(200).send({ message: "api server" });
});

app.get("/:roomId", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log("join-room");
    socket.join(roomId);
    // socket.to(roomId).broadcast.emit("user-connected",userId)
    io.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) => {
      console.log("message call");
      io.to(roomId).emit("create-message", message);
    });
  });
});

server.listen(process.env.PORT || 3030);
