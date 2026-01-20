import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

async function askOpenAI(userText) {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "你是公司內部助理，回答要簡短、清楚。若不確定就說不知道。" },
        { role: "user", content: userText }
      ]
    })
  });

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content;
  return text || "我目前無法回答，請稍後再試。";
}

app.post("/webhook", async (req, res) => {
  try {
    const event = req.body.events?.[0];
    if (!event || event.type !== "message" || event.message.type !== "text") {
      return res.send("OK");
    }

    const userText = event.message.text;
    const replyToken = event.replyToken;

    const answer = await askOpenAI(userText);

    await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: "text", text: answer }]
      })
    });

    res.send("OK");
  } catch (e) {
    res.send("OK");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
