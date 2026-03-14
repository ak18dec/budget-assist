import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function MerchantAvatar({ name }) {
  const letter = name?.charAt(0)?.toUpperCase() || "?"

  return (
    <Avatar className="size-9">
      <AvatarFallback className="bg-muted text-xs font-medium">
        {letter}
      </AvatarFallback>
    </Avatar>
  )
}