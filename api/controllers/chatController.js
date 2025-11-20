import Chat from "../models/Chat.js";
// import { ioInstance } from "../../index.js"; 

// Start chat (create new or return existing)
export const startChat = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const { sellerId } = req.body;

    if (!sellerId) {
      return res.status(400).json({ message: "Seller ID is required" });
    }

    if (!buyerId) {
      return res.status(400).json({ message: "Buyer ID missing" });
    }

    if (buyerId.toString() === sellerId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot start a chat with yourself" });
    }

    let chat = await Chat.findOne({ buyerId, sellerId });

    if (!chat) {
      chat = new Chat({
        buyerId,
        sellerId,
        messages: [],
      });
      await chat.save();
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.error("Error in startChat:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Send message in a chat
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { chatId, text } = req.body;

    if (!chatId || !text)
      return res.status(400).json({ message: "chatId and text required" });

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const newMsg = {
      sender: senderId,
      text,
      createdAt: new Date(),
    };

    chat.messages.push(newMsg);
    await chat.save();

    // 🔥 Emit real-time message to room
    // ioInstance.to(chatId).emit("receive_message", {
    //   chatId,
    //   text,
    //   sender: senderId,
    //   createdAt: newMsg.createdAt,
    // });

    return res.status(200).json({
      success: true,
      message: "Message sent",
      chat,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Get single chat by ID
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("buyerId", "name email")
      .populate("sellerId", "name email");

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// All chats for admin
export const getAllChatsForAdmin = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("buyerId", "name email")
      .populate("sellerId", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all chats (for admin or test)
export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("buyerId", "name email")
      .populate("sellerId", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};