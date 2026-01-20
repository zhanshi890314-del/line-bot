import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const event = req.body.events?.[0];
  if (!event || event.type !== "message") {
    return res.send("OK");
  }

  const replyToken = event.replyToken;

  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      replyToken,
      messages: [
        { type: "text", text: "我收到你的訊息了" }
      ]
    })
  });

  res.send("OK");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
