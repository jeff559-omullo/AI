import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./ai.css";

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const socketRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);

  console.log("AIChat component mounted");

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      console.warn("No student token found – socket will not connect");
      return;
    }
    console.log("Initializing student socket...");
    const socket = io("http://localhost:5000", {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Student socket connected");
      setSocketConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Student socket disconnected:", reason);
      setSocketConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Student socket error:", err.message);
      setSocketConnected(false);
    });

    socket.on("new-message", (msg) => {
      console.log("📩 Received message from officer:", msg);
      setChat((prev) => [...prev, { role: "officer", text: msg.text }]);
    });

    socket.on("session-started", () => {
      console.log("🔔 Officer has joined the chat");
      setChat((prev) => [...prev, { role: "system", text: "Officer has joined the chat." }]);
    });

    socket.on("session-closed", () => {
      console.log("🚪 Chat session ended");
      setChat((prev) => [...prev, { role: "system", text: "Chat session ended." }]);
      setSessionId(null);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  // Join session room when sessionId is set and socket is connected
  useEffect(() => {
    if (sessionId && socketRef.current && socketConnected) {
      console.log(`📡 Joining session room: ${sessionId}`);
      socketRef.current.emit("join-session", sessionId);
    }
  }, [sessionId, socketConnected]);

  const sendMessage = async () => {
    if (!message) return;

    const token = localStorage.getItem("studentToken");
    console.log("📝 Token retrieved:", token ? token.substring(0, 20) + "..." : "none");

    const newUserMessage = { role: "user", text: message };
    setChat((prev) => [...prev, newUserMessage]);

    try {
      if (sessionId) {
        // Human mode: send via socket
        if (socketRef.current && socketConnected) {
          console.log(`📤 Sending message to session ${sessionId}: ${message}`);
          socketRef.current.emit("send-message", {
            sessionId,
            sender: "student",
            text: message,
            token: token,
          });
        } else {
          console.error("Socket not connected, cannot send message");
          setChat((prev) => [...prev, { role: "error", text: "⚠️ Connection lost. Please refresh the page." }]);
        }
      } else {
        // AI mode: call the API
        console.log("🚀 Sending AI request with message:", message);
        const res = await axios.post(
          "http://localhost:5000/api/ai/chat",
          { message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("✅ AI response:", res.data);

        const data = res.data;
        if (data.type === "human") {
          console.log("🤝 Human connection triggered, sessionId:", data.sessionId);
          setSessionId(data.sessionId);
          setChat((prev) => [...prev, { role: "ai", text: data.reply }]);
        } else if (data.type === "ai") {
          setChat((prev) => [...prev, { role: "ai", text: data.reply }]);
        } else {
          setChat((prev) => [...prev, { role: "ai", text: data.reply || "Unexpected response" }]);
        }
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      setChat((prev) => [...prev, { role: "ai", text: "⚠️ AI not responding" }]);
    }

    setMessage("");
  };

  return (
    <>
      <div className="ai-button" onClick={() => setOpen(!open)}>
        🤖
      </div>

      {open && (
        <div className="ai-box">
          <div className="ai-header">
            {sessionId ? "Chat with Officer" : "AI Student Assistant"}
          </div>
          <div className="ai-chat">
            {chat.map((c, i) => (
              <div key={i} className={c.role}>
                {c.text}
              </div>
            ))}
          </div>
          <div className="ai-input">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                sessionId
                  ? "Type your message to the officer..."
                  : "Ask about fees, hostel, courses..."
              }
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}