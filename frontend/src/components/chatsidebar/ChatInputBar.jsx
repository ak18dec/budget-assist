import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { Plus } from "lucide-react"
import { ArrowUp } from "lucide-react"

export default function ChatInputBar({
  value,
  onChange,
  onSend,
  loading
}) {
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="border-t py-3">
      <div
        role="group"
        className="
        group relative flex flex-col w-full items-center
        rounded-lg border border-input
        bg-background
        transition-colors
        focus-within:border-ring
        focus-within:ring-2
        focus-within:ring-ring/30
        "
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask, search or chat..."
          rows={2}
          className="
          flex-1 resize-none border-0 bg-transparent
          shadow-none focus-visible:ring-0
          min-h-[56px]
          "
        />
        <div className="flex w-full justify-between gap-2 px-2 pb-2">
          <Button
            size="icon"
            variant="ghost"
            className="size-6 rounded-full"
          >
            <Plus size={16} />
          </Button>
          <Button
            size="icon"
            className="size-6 rounded-full"
            onClick={onSend}
            disabled={loading || !value.trim()}
          >
            <ArrowUp size={16}/>
          </Button>
        </div>
      </div>
    </div>
  )
}