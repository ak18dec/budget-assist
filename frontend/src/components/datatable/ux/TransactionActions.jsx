import {
  MoreHorizontal,
  Pencil,
  Trash,
  Eye
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TransactionActions({ transaction }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Eye className="mr-2 size-4" />
          View
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Pencil className="mr-2 size-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem className="text-destructive">
          <Trash className="mr-2 size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}