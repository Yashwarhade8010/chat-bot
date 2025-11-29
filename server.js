const express = require("express");
const dotenv = require("dotenv");
const { default: axios } = require("axios");
const cors = require("cors");


dotenv.config();
const { ElevenLabsClient, play } = require ('@elevenlabs/elevenlabs-js');
const { Readable } = require('stream');
const elevenlabs = new ElevenLabsClient({apiKey:process.env.ELEVENLABS_API_KEY});


const app = express();

app.use(cors());
app.use(express.json());
app.post("/api/chat/", async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Act as a indian person who reply normaly.",
          },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API}`,
        },
      }
    );
    const aireply = response.data.choices[0].message.content;

    return res.send(aireply);
  } catch (err) {
    console.log(err);
  }
});
app.listen(process.env.PORT, () =>
  console.log(`Server started at PORT:${process.env.PORT}`)
);
