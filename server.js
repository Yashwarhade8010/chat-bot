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

    const audio = await elevenlabs.textToSpeech.convert(
      "JBFqnCBsd6RMkjVDRZzb",
      {
        text: aireply,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
      }
    );

    const reader = audio.getReader();
    const stream = new Readable({
      async read() {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(value);
        }
      },
    });
    const result = await play(stream);

    res.send(aireply);
    return res.send(result);
  } catch (err) {
    console.log(err);
  }
});
app.listen(process.env.PORT, () =>
  console.log(`Server started at PORT:${process.env.PORT}`)
);
