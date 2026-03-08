// import { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import "./ChatPanel.css";
// import { GoDependabot, GoTrash } from "react-icons/go";
// import { FiSend, FiCopy, FiCheck } from "react-icons/fi";
// import { fmtTime } from "@/lib/utils";  

// const API_URL = import.meta.env.VITE_API_URL || "";

// const initialMessages = [
//     {
//         id: 1,
//         text: "Welcome! How can I assist you with your finances today?",
//         sender: "bot",
//         timestamp: new Date(),
//     },
// ];

// function TypingIndicator() {
//     return (
//     <div className="typing-indicator typing-fade-in">
//         <span />
//         <span />
//         <span />
//     </div>
//     )
// }

// function isMobile() {
//     return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
// }

// export default function ChatPanel({ expanded, onToggle }) {
//     const [inputText, setInputText] = useState("");
//     const [messages, setMessages] = useState([...initialMessages]);
//     const [loading, setLoading] = useState(false);
//     const messagesEndRef = useRef(null);
//     const textareaRef = useRef(null);
//     const [radius, setRadius] = useState(999);
//     const [botTyping, setBotTyping] = useState(false)
//     const [copiedId, setCopiedId] = useState(null);

//     useEffect(() => {
//         const el = textareaRef.current;
//         if (!el) return;

//         // Auto-grow height
//         el.style.height = "auto";
//         const maxHeight = 160;
//         const height = Math.min(el.scrollHeight, maxHeight);
//         el.style.height = height + "px";

//         // Line-based calculation (WhatsApp-like)
//         const lineHeight = 20;
//         const baseHeight = 44;
//         const lines = Math.max(
//             1,
//             Math.round((height - baseHeight) / lineHeight) + 1
//         );

//         // Non-linear radius curve (ease-out)
//         const minRadius = 18;
//         const maxRadius = 999;
//         const t = Math.min((lines - 1) / 3, 1); // normalize 1–4 lines
//         const eased = 1 - Math.pow(1 - t, 2.5);

//         const newRadius = maxRadius - eased * (maxRadius - minRadius);

//         setRadius(newRadius);
//     }, [inputText]);

//     const handleKeyPress = (e) => {
//         if (e.key === "Enter" && !e.shiftKey) {
//             e.preventDefault();
//             send();
//         }
//     };

//     function handleKeyDown(e) {
//         // Desktop: Enter = send, Shift+Enter = newline
//         if (e.key === "Enter" && !e.shiftKey && !isMobile()) {
//             e.preventDefault();
//             send();
//         }
//     }

//     const clearChat = () => {
//         setMessages([...initialMessages]);
//     };

//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     };

//     const handleCopy = async (text, id) => {
//         try {
//             await navigator.clipboard.writeText(text);
//             setCopiedId(id);

//             setTimeout(() => {
//                 setCopiedId(null);
//             }, 1500);
//         } catch (err) {
//             console.error("Copy failed:", err);
//         }
//     };

//     useEffect(() => {
//         scrollToBottom();
//     }, [messages, expanded]);

//     async function send() {
//         if (!inputText.trim() || loading) return;

//         const userMessage = {
//             id: messages.length + 1,
//             text: inputText,
//             sender: "user",
//             timestamp: new Date(),
//         };
//         setMessages((prevMessages) => [...prevMessages, userMessage]);
//         setInputText("");
//         setBotTyping(true)
//         setLoading(true);

//         try {
//             const res = await axios.post(`${API_URL}/chat/`, {
//                 user_id: "123", // Replace with actual user ID if available
//                 message: userMessage.text,
//             });

//             setMessages((prevMessages) => [
//                 ...prevMessages,
//                 {
//                     id: prevMessages.length + 1,
//                     text: res.data.response,
//                     sender: "bot",
//                     timestamp: new Date(),
//                 },
//             ]);
//         } catch (err) {
//             setMessages((prevMessages) => [
//                 ...prevMessages,
//                 {
//                     id: prevMessages.length + 1,
//                     text: "Failed to get response",
//                     sender: "bot",
//                     timestamp: new Date(),
//                 },
//             ]);
//         } finally {
//             setLoading(false);
//             setBotTyping(false)
//         }
//     }

//     return (
//         <div className="chat-panel">
//             <div
//                 className="chat-header"
//                 style={{
//                     justifyContent: expanded ? "space-between" : "center",
//                 }}
//             >
//                 <div className="chat-logo">
//                     {expanded && (
//                         <h3 style={{ marginTop: 0, margin: 0 }}>BudgetAI</h3>
//                     )}
//                     <button
//                         className="chat-toggle"
//                         onClick={onToggle}
//                         title={expanded ? "Collapse" : "Expand"}
//                     >
//                         {expanded ? <GoDependabot /> : <GoDependabot />}
//                     </button>
//                 </div>
//                 <div className="chat-header-clear">
//                     {expanded && (
//                         <button
//                             className="button chat-clear"
//                             onClick={clearChat}
//                             title="Clear Chat"
//                         >
//                             <GoTrash />
//                         </button>
//                     )}
//                 </div>
//             </div>
//             {expanded && (
//                 <>
//                     <div className="chat-window">
//                         {messages.map((message, i) => (
//                             <div
//                                 key={message.id}
//                                 className={`chat-message ${
//                                     message.sender === "user" ? "user" : "bot"
//                                 }`}
//                             >
//                                 <div className="message-content">
//                                     <div className="message-text">
//                                         {message.text}
//                                     </div>
//                                     <div className="message-meta">
//                                         <div className="message-time">
//                                             {fmtTime(message.timestamp)}
//                                         </div>
//                                         <button
//                                             className="copy-button"
//                                             onClick={() => handleCopy(message.text, message.id)}
//                                         >
//                                             {copiedId === message.id ? <FiCheck /> : <FiCopy />}
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}

//                         {botTyping && (
//                           <div className="chat-bubble bot">
//                             <TypingIndicator />
//                           </div>
//                         )}

//                         <div ref={messagesEndRef}></div>
//                     </div>

//                     <div className="chat-input-container">
//                         <div className="chat-input-wrapper">
//                             <textarea
//                                 ref={textareaRef}
//                                 className="chat-input"
//                                 value={inputText}
//                                 onChange={(e) => setInputText(e.target.value)}
//                                 placeholder="Ask about budgets, spending, goals…"
//                                 rows={1}
//                                 onKeyDown={handleKeyDown}
//                                 enterKeyHint="send"
//                                 style={{ borderRadius: `${radius}px` }}
//                             />
//                             <button
//                                 className="send-button"
//                                 onClick={send}
//                                 disabled={loading || !inputText.trim()}
//                                 aria-label="send"
//                                 style={{ marginBottom: radius < 999 ? 4 : 7 }}
//                             >
//                                 {loading ? (
//                                     <span className="spinner" />
//                                 ) : (
//                                     <FiSend />
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// import { useState, useRef, useEffect } from "react"
// import axios from "axios"

// import { Card, CardHeader, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { ScrollArea } from "@/components/ui/scroll-area"

// import { GoDependabot, GoTrash } from "react-icons/go"
// import { FiSend, FiCopy, FiCheck } from "react-icons/fi"

// import { fmtTime } from "@/utils/Formatters.js"

// const API_URL = import.meta.env.VITE_API_URL || ""

// const initialMessages = [
//   {
//     id: 1,
//     text: "Welcome! How can I assist you with your finances today?",
//     sender: "bot",
//     timestamp: new Date(),
//   },
// ]

// function TypingIndicator() {
//   return (
//     <div className="flex gap-1 px-3 py-2">
//       <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
//       <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.15s]" />
//       <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.3s]" />
//     </div>
//   )
// }

// function isMobile() {
//   return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
// }

// export default function ChatPanel({ expanded, onToggle }) {
//   const [inputText, setInputText] = useState("")
//   const [messages, setMessages] = useState([...initialMessages])
//   const [loading, setLoading] = useState(false)
//   const [botTyping, setBotTyping] = useState(false)
//   const [copiedId, setCopiedId] = useState(null)

//   const messagesEndRef = useRef(null)
//   const textareaRef = useRef(null)

//   const [radius, setRadius] = useState(999)

//   useEffect(() => {
//     const el = textareaRef.current
//     if (!el) return

//     el.style.height = "auto"
//     const maxHeight = 160
//     const height = Math.min(el.scrollHeight, maxHeight)
//     el.style.height = height + "px"

//     const lineHeight = 20
//     const baseHeight = 44

//     const lines = Math.max(
//       1,
//       Math.round((height - baseHeight) / lineHeight) + 1
//     )

//     const minRadius = 18
//     const maxRadius = 999

//     const t = Math.min((lines - 1) / 3, 1)
//     const eased = 1 - Math.pow(1 - t, 2.5)

//     const newRadius = maxRadius - eased * (maxRadius - minRadius)

//     setRadius(newRadius)
//   }, [inputText])

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [messages, expanded])

//   function handleKeyDown(e) {
//     if (e.key === "Enter" && !e.shiftKey && !isMobile()) {
//       e.preventDefault()
//       send()
//     }
//   }

//   const clearChat = () => {
//     setMessages([...initialMessages])
//   }

//   const handleCopy = async (text, id) => {
//     await navigator.clipboard.writeText(text)
//     setCopiedId(id)

//     setTimeout(() => {
//       setCopiedId(null)
//     }, 1500)
//   }

//   async function send() {
//     if (!inputText.trim() || loading) return

//     const userMessage = {
//       id: messages.length + 1,
//       text: inputText,
//       sender: "user",
//       timestamp: new Date(),
//     }

//     setMessages((prev) => [...prev, userMessage])
//     setInputText("")
//     setLoading(true)
//     setBotTyping(true)

//     try {
//       const res = await axios.post(`${API_URL}/chat/`, {
//         user_id: "123",
//         message: userMessage.text,
//       })

//       setMessages((prev) => [
//         ...prev,
//         {
//           id: prev.length + 1,
//           text: res.data.response,
//           sender: "bot",
//           timestamp: new Date(),
//         },
//       ])
//     } catch {
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: prev.length + 1,
//           text: "Failed to get response",
//           sender: "bot",
//           timestamp: new Date(),
//         },
//       ])
//     } finally {
//       setLoading(false)
//       setBotTyping(false)
//     }
//   }

//   return (
//     <Card className="w-full h-full flex flex-col">
//       {/* Header */}

//       <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
//         <div className="flex items-center gap-2">
//           {expanded && <h3 className="font-semibold">BudgetAI</h3>}

//           <Button
//             size="icon"
//             variant="ghost"
//             onClick={onToggle}
//           >
//             <GoDependabot />
//           </Button>
//         </div>

//         {expanded && (
//           <Button
//             size="icon"
//             variant="ghost"
//             onClick={clearChat}
//           >
//             <GoTrash />
//           </Button>
//         )}
//       </CardHeader>

//       {expanded && (
//         <>
//           {/* Chat Messages */}

//           <CardContent className="flex-1 p-0">
//             <ScrollArea className="h-[400px] px-4 py-3">
//               <div className="flex flex-col gap-3">

//                 {messages.map((message) => (
//                   <div
//                     key={message.id}
//                     className={`flex ${
//                       message.sender === "user"
//                         ? "justify-end"
//                         : "justify-start"
//                     }`}
//                   >
//                     <div
//                       className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow
//                         ${
//                           message.sender === "user"
//                             ? "bg-primary text-primary-foreground"
//                             : "bg-muted"
//                         }`}
//                     >
//                       <div>{message.text}</div>

//                       <div className="flex items-center justify-between mt-1 text-xs opacity-70">
//                         <span>{fmtTime(message.timestamp)}</span>

//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="h-6 w-6"
//                           onClick={() =>
//                             handleCopy(message.text, message.id)
//                           }
//                         >
//                           {copiedId === message.id ? (
//                             <FiCheck size={14} />
//                           ) : (
//                             <FiCopy size={14} />
//                           )}
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}

//                 {botTyping && (
//                   <div className="flex justify-start">
//                     <div className="bg-muted rounded-2xl">
//                       <TypingIndicator />
//                     </div>
//                   </div>
//                 )}

//                 <div ref={messagesEndRef} />
//               </div>
//             </ScrollArea>
//           </CardContent>

//           {/* Input */}

//           <div className="p-3 border-t">
//             <div className="flex gap-2 items-end">

//               <Textarea
//                 ref={textareaRef}
//                 value={inputText}
//                 rows={1}
//                 placeholder="Ask about budgets, spending, goals…"
//                 onChange={(e) => setInputText(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 style={{ borderRadius: `${radius}px` }}
//                 className="resize-none max-h-[160px]"
//               />

//               <Button
//                 size="icon"
//                 onClick={send}
//                 disabled={loading || !inputText.trim()}
//                 className="shrink-0"
//               >
//                 <FiSend />
//               </Button>

//             </div>
//           </div>
//         </>
//       )}
//     </Card>
//   )
// }


import { useState, useRef, useEffect } from "react"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { GoTrash } from "react-icons/go"
import ChatMessage from "./ChatMessage"
import TypingIndicator from "./TypingIndicator"
import ChatInputBar from "./ChatInputBar"

const API_URL = import.meta.env.VITE_API_URL || ""

const initialMessages = [
  {
    id: 1,
    text: "Welcome! How can I assist you with your finances today?",
    sender: "bot",
    timestamp: new Date(),
  },
]

export default function ChatPanel() {

  const [messages, setMessages] = useState(initialMessages)
  const [inputText, setInputText] = useState("")
  const [copiedId, setCopiedId] = useState(null)
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const clearChat = () => {
    setMessages(initialMessages)
  }

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)

    setTimeout(() => setCopiedId(null), 1500)
  }

  async function send() {

    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputText("")
    setLoading(true)

    const botId = Date.now() + 1

    setMessages(prev => [
      ...prev,
      {
        id: botId,
        text: "",
        sender: "bot",
        timestamp: new Date(),
      }
    ])

    const res = await fetch(`${API_URL}/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: "123",
        message: userMessage.text,
      }),
    })

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {

      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value)

      setMessages(prev =>
        prev.map(m =>
          m.id === botId
            ? { ...m, text: m.text + chunk }
            : m
        )
      )
    }

    setLoading(false)
  }

  function handleKeyDown(e) {

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }

  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-row items-center justify-between border-b">
        <h3 className="font-semibold">BudgetAI</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearChat}
        >
          <GoTrash/>
        </Button>
      </div>
      <div className="flex-1 p-0">
        <ScrollArea className="h-full px-4 py-3">
          <div className="flex flex-col gap-4">
            {messages.map(message => (
              <ChatMessage
                key={message.id}
                message={message}
                copiedId={copiedId}
                handleCopy={handleCopy}
              />
            ))}
            {loading && <TypingIndicator/>}
            <div ref={messagesEndRef}/>
          </div>
        </ScrollArea>
      </div>
      <ChatInputBar
        value={inputText}
        onChange={setInputText}
        onSend={send}
        loading={loading}
      />
    </div>
  )
}