const app = require("./app");
const debug = require("debug")("chat-app:server");
const http = require("http");
const socketIo = require("socket.io");
const Chat = require("./models/messages");

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://mind-scape-front-end.vercel.app", // Origine de votre frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("chat message", async (msg) => {
    try {
      const chatMessage = new Chat({
        message: msg.message,
        username: msg.username,
        projectID: msg.projectID,
      });
      await chatMessage.save();
      io.emit("chat message", chatMessage);
    } catch (error) {
      console.error("Error saving message: ", error);
    }
  });

  socket.on("private message", async (msg) => {
    try {
      const privateMessage = new Chat({
        message: msg.message,
        username: msg.username,
        senderId: msg.senderId,
        recipientId: msg.recipientId,
      });
      await privateMessage.save();

      socket.to(msg.recipientId).emit("private message", privateMessage);
      socket.emit("private message", privateMessage);
    } catch (error) {
      console.error("Error saving private message: ", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
