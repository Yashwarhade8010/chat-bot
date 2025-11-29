const express = require("express");
const dotenv = require("dotenv");
const { default: axios } = require("axios");
const cors = require("cors");


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode == "subscribe" && token == process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.status(400).send({ message: "Unverified" });
});

app.post("/", async (req, res) => {
  const body = req.body;

  try {
    if (body.object == "whatsapp_business_account") {
      const messages = body.entry?.[0].changes?.[0].entry?.[0].value?.messages;
      if (messages && messages.length > 0) {
        const msg = messages[0];
        const from = messages.from;
        const text = messages.text?.body;
        const response = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content: "Act as a indian person who reply normaly.",
              },
              { role: "user", content: text },
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

        axios.post(
          `https://graph.facebook.com/v17.0/${process.env.PHONE_NUMBER_ID}/messages`,
          {
            messaging_product: "whatsapp",
            to: from,
            text: { body: aireply },
          },
          { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
        );

        return res.send(aireply);
      } else {
        return res.status(400).send("bad request");
      }
    }
  } catch (err) {
    console.log(err);
  }
});
app.listen(process.env.PORT, () =>
  console.log(`Server started at PORT:${process.env.PORT}`)
);
