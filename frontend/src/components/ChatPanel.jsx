import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./ChatPanel.css";
import { GoDependabot, GoTrash } from "react-icons/go";
import { FiSend, FiCopy, FiCheck } from "react-icons/fi";
import { GoCopy, GoCheck } from "react-icons/go";
import { fmtTime } from '../utils/Formatters.js'

const API_URL = import.meta.env.VITE_API_URL || "";

const initialMessages = [
    {
        id: 1,
        text: "Welcome! How can I assist you with your finances today?",
        sender: "bot",
        timestamp: new Date(),
    },
];

function TypingIndicator() {
    return (
    <div className="typing-indicator typing-fade-in">
        <span />
        <span />
        <span />
    </div>
    )
}

function isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function ChatPanel({ expanded, onToggle }) {
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState([...initialMessages]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const [radius, setRadius] = useState(999);
    const [botTyping, setBotTyping] = useState(false)
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        // Auto-grow height
        el.style.height = "auto";
        const maxHeight = 160;
        const height = Math.min(el.scrollHeight, maxHeight);
        el.style.height = height + "px";

        // Line-based calculation (WhatsApp-like)
        const lineHeight = 20;
        const baseHeight = 44;
        const lines = Math.max(
            1,
            Math.round((height - baseHeight) / lineHeight) + 1
        );

        // Non-linear radius curve (ease-out)
        const minRadius = 18;
        const maxRadius = 999;
        const t = Math.min((lines - 1) / 3, 1); // normalize 1–4 lines
        const eased = 1 - Math.pow(1 - t, 2.5);

        const newRadius = maxRadius - eased * (maxRadius - minRadius);

        setRadius(newRadius);
    }, [inputText]);

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    function handleKeyDown(e) {
        // Desktop: Enter = send, Shift+Enter = newline
        if (e.key === "Enter" && !e.shiftKey && !isMobile()) {
            e.preventDefault();
            send();
        }
    }

    const clearChat = () => {
        setMessages([...initialMessages]);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleCopy = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);

            setTimeout(() => {
                setCopiedId(null);
            }, 1500);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, expanded]);

    async function send() {
        if (!inputText.trim() || loading) return;

        const userMessage = {
            id: messages.length + 1,
            text: inputText,
            sender: "user",
            timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInputText("");
        setBotTyping(true)
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/chat/`, {
                message: userMessage.text,
            });

            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: prevMessages.length + 1,
                    text: res.data.response,
                    sender: "bot",
                    timestamp: new Date(),
                },
            ]);
        } catch (err) {
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: prevMessages.length + 1,
                    text: "Failed to get response",
                    sender: "bot",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setLoading(false);
            setBotTyping(false)
        }
    }

    return (
        <div className="chat-panel">
            <div
                className="chat-header"
                style={{
                    justifyContent: expanded ? "space-between" : "center",
                }}
            >
                <div className="chat-logo">
                    {expanded && (
                        <h3 style={{ marginTop: 0, margin: 0 }}>BudgetAI</h3>
                    )}
                    <button
                        className="chat-toggle"
                        onClick={onToggle}
                        title={expanded ? "Collapse" : "Expand"}
                    >
                        {expanded ? <GoDependabot /> : <GoDependabot />}
                    </button>
                </div>
                <div className="chat-header-clear">
                    {expanded && (
                        <button
                            className="button chat-clear"
                            onClick={clearChat}
                            title="Clear Chat"
                        >
                            <GoTrash />
                        </button>
                    )}
                </div>
            </div>
            {expanded && (
                <>
                    <div className="chat-window">
                        {messages.map((message, i) => (
                            <div
                                key={message.id}
                                className={`chat-message ${
                                    message.sender === "user" ? "user" : "bot"
                                }`}
                            >
                                <div className="message-content">
                                    <div className="message-text">
                                        {message.text}
                                    </div>
                                    <div className="message-meta">
                                        <div className="message-time">
                                            {fmtTime(message.timestamp)}
                                        </div>
                                        <button
                                            className="copy-button"
                                            onClick={() => handleCopy(message.text, message.id)}
                                        >
                                            {copiedId === message.id ? <FiCheck /> : <FiCopy />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {botTyping && (
                          <div className="chat-bubble bot">
                            <TypingIndicator />
                          </div>
                        )}

                        <div ref={messagesEndRef}></div>
                    </div>

                    <div className="chat-input-container">
                        <div className="chat-input-wrapper">
                            <textarea
                                ref={textareaRef}
                                className="chat-input"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Ask about budgets, spending, goals…"
                                rows={1}
                                onKeyDown={handleKeyDown}
                                enterKeyHint="send"
                                style={{ borderRadius: `${radius}px` }}
                            />
                            <button
                                className="send-button"
                                onClick={send}
                                disabled={loading || !inputText.trim()}
                                aria-label="send"
                                style={{ marginBottom: radius < 999 ? 4 : 7 }}
                            >
                                {loading ? (
                                    <span className="spinner" />
                                ) : (
                                    <FiSend />
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
