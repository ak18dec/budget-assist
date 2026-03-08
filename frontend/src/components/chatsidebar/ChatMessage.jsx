import { Button } from "@/components/ui/button"
import { FiCopy, FiCheck } from "react-icons/fi"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { fmtTime } from "@/utils/Formatters.js"

export default function ChatMessage({
  message,
  copiedId,
  handleCopy
}) {

  const isUser = message.sender === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>

      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">
          AI
        </div>
      )}

      <div
        className={`group max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow
        ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >

        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.text}
        </ReactMarkdown>

        <div className="flex items-center justify-between text-xs mt-2 opacity-70">

          <span>{fmtTime(message.timestamp)}</span>

          <Button
            size="icon"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 h-6 w-6"
            onClick={() => handleCopy(message.text, message.id)}
          >
            {copiedId === message.id
              ? <FiCheck size={14}/>
              : <FiCopy size={14}/>}
          </Button>

        </div>

      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-xs text-white">
          U
        </div>
      )}

    </div>
  )
}