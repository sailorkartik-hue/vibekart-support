import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const filePath = path.join(process.cwd(), "orders.json");
    const orders = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const { message } = req.body;

    const orderId = message.match(/\d+/)?.[0];
    const order = orders.find(o => o.orderId === orderId);

    if (/unhappy|angry|disappointed|frustrated/i.test(message)) {
      return res.json({
        reply: "I'm sorry you're upset. Let me escalate this to a human agent immediately.",
        escalate: true,
      });
    }

    const systemPrompt = order
      ? `Customer order details: 
        Order ID: ${order.orderId}
        Name: ${order.name}
        Product: ${order.product}
        Status: ${order.status}
        Issue: ${order.issue}
        Expected Delivery: ${order.expectedDate}
        `
      : `You are a helpful customer support AI. The user is asking a general support question.`;

    // 🔥 UNIVERSAL DIRECT OPENAI CALL
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await openAIResponse.json();

    return res.json({
      reply: data.choices?.[0]?.message?.content || "Sorry, I could not generate a response.",
      escalate: false,
    });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server crashed" });
  }
}

