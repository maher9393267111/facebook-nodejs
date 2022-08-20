require("dotenv").config();
require("express-async-errors");
const { clientURL } = require("./URL");
const fileUpload = require("express-fileupload");
const express = require("express");
const cloudinary = require("cloudinary").v2;


const connectDB = require("./db/connect");

//security dependencies

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");


//app initialization

const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: clientURL } });
const PORT = process.env.PORT || 5000;

//cloudinary configuration

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_API_KEY,
	api_secret: process.env.CLOUD_API_SECRET,
});

app.get("/", (req, res) => {
	res.status(200).json({ message: "welcome" });
});


io.on("connection", socket => {
	io.emit("usersOnline", addUser(socket.handshake.query.id, socket.id));
	socket.on("send message", async (message, to, chatId, id) => {
		socket.to(getSocketID(to)).emit("receive message", message, getUserID(socket.id));
		await createMessage({ chatId, id, message });
	});
	socket.on("delete chat", async (chatID, to) => {
		socket.to(getSocketID(to)).emit("delete chat", chatID);
		await deleteChat({ chatID });
	});
	socket.on("clear chat", async (chatID, to) => {
		socket.to(getSocketID(to)).emit("clear chat", chatID);
		await deleteMessages({ chatID });
	});
	socket.on("disconnect", () => {
		io.emit("usersOnline", removeUser(socket.id));
	});
});







const start = async () => {
	try {
		await connectDB(process.env.MONGO_URI);
		server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
	} catch (error) {
		console.log(error);
	}
};

start();