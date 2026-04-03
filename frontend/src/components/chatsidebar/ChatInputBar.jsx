// import { Textarea } from "@/components/ui/textarea"
// import { Button } from "@/components/ui/button"
// import { Plus } from "lucide-react"
// import { ArrowUp } from "lucide-react"

// export default function ChatInputBar({
//   value,
//   onChange,
//   onSend,
//   loading
// }) {
//   function handleKeyDown(e) {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault()
//       onSend()
//     }
//   }

//   return (
//     <div className="border-t py-3">
//       <div
//         role="group"
//         className="
//           group relative flex flex-col w-full items-center
//           rounded-lg border border-input
//           bg-background
//           transition-colors
//           focus-within:border-ring
//         "
//       >
//         <Textarea
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Ask, search or chat..."
//           rows={2}
//           className="
//           flex-1 resize-none border-0 bg-transparent
//           shadow-none focus-visible:ring-0
//           min-h-[56px]
//           "
//         />
//         <div className="flex w-full justify-between gap-2 px-2 pb-2">
//           <Button
//             size="icon"
//             variant="ghost"
//             className="size-6 rounded-full cursor-pointer"
//           >
//             <Plus size={16} />
//           </Button>
//           <Button
//             size="icon"
//             className="size-6 rounded-full cursor-pointer"
//             onClick={onSend}
//             disabled={loading || !value.trim()}
//           >
//             <ArrowUp size={16}/>
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }


import { useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, ArrowUp } from "lucide-react"

export default function ChatInputBar({
  value,
  onChange,
  onSend,
  loading
}) {
  const textareaRef = useRef(null)

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault()
      onSend()
    }
  }

  function handleChange(e) {
    onChange(e.target.value)
  }

  // auto resize
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return

    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <div className="border-t py-3">
      <div
        className="
        relative flex flex-col w-full
        rounded-xl border border-input
        bg-background
        focus-within:border-ring
        transition-colors
      "
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your finances..."
          rows={1}
          className="
            resize-none border-0 bg-transparent
            shadow-none focus-visible:ring-0
            px-3 pt-3
            min-h-[44px]
            max-h-[240px]
            overflow-y-auto
            transition-[height] duration-100
          "
        />
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <Button
            size="icon"
            variant="ghost"
            className="size-6 rounded-full cursor-pointer"
          >
            <Plus size={16} />
          </Button>
          <Button
            size="icon"
            className="size-6 rounded-full cursor-pointer"
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