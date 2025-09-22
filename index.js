import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import cors from "cors";

const app = express();
const upload = multer();
const ai = new GoogleGenAI({});

// inisialisasi model AI
const geminiModels = {
  text: "gemini-2.5-flash-lite",
  chat: "gemini-2.5-pro",
  image: "gemini-2.5-flash",
  audio: "gemini-2.5-flash-lite",
  document: "gemini-2.5-flash-lite"
};

// inisialisasi aplikasi backend
app.use(cors()); // panggil middleware
app.use(express.json()); // membolehkan menggunakan 'Content-Type: application/json' dihaeder

// inisialisasi route
app.post('/generate-text', async (req, res) => {
  
  // handle request diterima
  const { message } = req.body || {};

  if (!message || typeof message !== "string") {
    res.status(400).json({ message: "Pesan tidak ada atau format tidak sesuai." });
    return;
  } 

  // logic dimulai
  const response = await ai.models.generateContent({
    contents: message,
    model: geminiModels.text
  });

  res.status(200).json({
    reply: response.text
  });

});

app.post('/chat', async (req, res) => {
  const { conversation } = req.body;

  // cek validasi array atau bukan
  if (!conversation || !Array.isArray(conversation)) {
    res.status(400).json({
      success: false,
      data: null,
      message: 'Percakapan tidak valid!'
    });
  }

  // cek integritas data
  let dataIsInvalid =  false; //semantic
  
  conversation.forEach(item => {
    if (!item) {
      dataIsInvalid = true;
    } else if (typeof item !== 'object') {
      dataIsInvalid = true;
    } else if (!item.role || !item.message) {
      dataIsInvalid = true;
    }
  
  });

  if(dataIsInvalid) {
    res.status(400).json({
      success: false,
      data: null,
      message: 'Ada Data tidak valid pada percakapan yang dikirim'
    });
}

// mapping
const contents = conversation.map(item => {
    return {
      role: item.role,
      parts: [
        { text: item.message}
      ]   
    } 
});

try {
  const aiResponse = await ai.models.generateContent({
    model: geminiModels.chat,
    contents
  });
  
  return res.status(200).json({
    success: true,
    data: aiResponse.text,
    message: null
  });

} catch (e) {
  console.log({ e });
  return res.status(500).json({
    success: false,
    data: null,
    message: e.message
  });
}


});

// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: "apakah ijazah jokowi asli?",
//   });
//   console.log(response.text);
// }

// await main();

// panggil app nya
const port = 3000;

app.listen(port, () => {
  console.log("I LOVE YOU", port);
});