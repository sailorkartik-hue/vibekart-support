import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋 — I'm VibeKart Support. How can I help you today?" }
  ]);

  async function sendMessage() {
    if (!input.trim()) return;
    const text = input;
    setMessages(m => [...m, { sender: "user", text }]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();

    setMessages(m => [...m, { sender: data.escalate ? "system" : "bot", text: data.reply }]);
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>🛍️ VibeKart Support</h2>
      <div style={{ height: 400, overflow: "auto", border: "1px solid #ccc", padding: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ margin: "6px 0", textAlign: msg.sender === "user" ? "right" : "left" }}>
            <b>{msg.sender}:</b> {msg.text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Ask about your order..."
        style={{ width: "70%", padding: 8, marginTop: 10 }}
      />
      <button onClick={sendMessage} style={{ padding: "8px 16px" }}>Send</button>
    </div>
  );
}
