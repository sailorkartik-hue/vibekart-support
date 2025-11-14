import fs from "fs";
import path from "path";
import OpenAI from "openai";

const orders = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "orders.json"), "utf8")
);

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { message } = req.body;

    const orderId = message.match(/\d+/)?.[0];
    const order = orders.find((o) => o.orderId === orderId);

    if (/unhappy|angry|disappointed|frustrated/i.test(message)) {
      return res.json({
        reply:
          "I'm really sorry you're facing this. Let me connect you to a human agent immediately.",
        escalate: true,
      });
    }

    const systemPrompt = order
      ? `You are a support assistant. Order ${order.orderId} for ${order.name}. Status: ${order.status}.`
      : `You are a helpful customer support assistant.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    return res.json({
      reply: completion.choices[0].message.content,
      escalate: false,
    });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Server error - check logs" });
  }
}
