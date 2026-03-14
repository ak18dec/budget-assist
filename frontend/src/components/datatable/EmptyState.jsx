import { Receipt } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border rounded-md">
      <Receipt className="mb-3 h-8 w-8 text-muted-foreground" />

      <h3 className="text-sm font-semibold">No transactions found</h3>

      <p className="text-sm text-muted-foreground mt-1">
        Transactions will appear here once they are recorded.
      </p>
    </div>
  )
}