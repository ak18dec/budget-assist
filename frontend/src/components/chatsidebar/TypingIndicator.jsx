export default function TypingIndicator() {
  return (
    <div className="flex gap-1 px-3 py-2">
      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
    </div>
  )
}