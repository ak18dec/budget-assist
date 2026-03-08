import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { fmtTime } from "@/utils/Formatters.js"
import { Copy, Check } from 'lucide-react';

export default function ChatMessage({message, copiedId, handleCopy}) {
  const isUser = message.sender === "user"
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
      <div
        className={`group max-w-[75%] min-w-[50%] rounded-lg px-3 py-2 text-xs
        ${ isUser ? "bg-primary text-primary-foreground" : "bg-muted" }`}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.text}
        </ReactMarkdown>
        <div className="flex items-center justify-between text-[10px] mt-2 opacity-70">
          <span>{fmtTime(message.timestamp)}</span>
          <Button
            size="icon"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 h-2 w-2"
            onClick={() => handleCopy(message.text, message.id)}
          >
            {copiedId === message.id ? <Check size={4}/> : <Copy size={4}/>}
          </Button>
        </div>
      </div>
    </div>
  )
}