import fs from "fs";
import path from "path";
import OpenAI from "openai";

const orders = JSON.parse(fs.readFileSync(path.join(process.cwd(), "orders.json"), "utf8"));
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const { message } = req.body;

  const orderId = message.match(/\d+/)?.[0];
  const order = orders.find(o => o.orderId === orderId);

  if (/unhappy|angry|disappointed/i.test(message)) {
    return res.json({
      reply: "I'm sorry you're facing this. Connecting you to a human agent now.",
      escalate: true
    });
  }

  const systemPrompt = order
    ? `You are a support assistant. Order ${order.orderId} for ${order.name}. Status: ${order.status}.`
    : "You are a support assistant.";

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ]
  });

  res.json({
    reply: completion.choices[0].message.content,
    escalate: false
  });
}
