const { StatusCodes } = require("http-status-codes");
const Message = require("../models/Message");
const Chat = require("../models/Chat");

// get chat all message by chatId
const getMessages = async (req, res) => {
	const { chatId } = req.query;
	const messages = await Message.find({ chatID: chatId });
	res.status(StatusCodes.OK).json({ messages });
};

// delete  all chats whee  lastMessage field is null 
const deleteM = async (req, res) => {
	if (req.user.id === "61aed3a59b979260987c4fbf") {
		const messages = await Chat.deleteMany({ lastMessage: { $exists: false } });
		res.status(StatusCodes.OK).json({ messages });
	}
	res.json({ msg: "feck u bitch" });
};

// create Messages


const createMessage =  async(res,req) =>{


    
}



module.exports = { getMessages, deleteM };