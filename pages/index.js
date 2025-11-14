import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋 — I'm VibeKart Support. How can I help you today?" }
  ]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: data.reply || "[No response received]" }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong." }
      ]);
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>🛍️ VibeKart Support</h2>
      <div style={{ height: 400, overflowY: "scroll", border: "1px solid #ccc", padding: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ margin: "6px 0", textAlign: msg.sender === "user" ? "right" : "left" }}>
            <b>{msg.sender}:</b> {msg.text}
          </div>
        ))}
        {loading && <div><i>bot is typing...</i></div>}
      </div>

      <div style={{ marginTop: 10, display: "flex" }}>
        <input
          style={{ flex: 1, padding: 8 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your order..."
        />
        <button onClick={sendMessage} style={{ padding: "8px 16px" }}>Send</button>
      </div>
    </div>
  );
}

