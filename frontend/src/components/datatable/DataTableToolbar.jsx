import { Input } from "@/components/ui/input"

export function DataTableToolbar({ table }) {
  return (
    <div className="flex items-center justify-between">
      <Input
        placeholder="Search transactions..."
        value={table.getColumn("category")?.getFilterValue() ?? ""}
        onChange={(event) =>
          table.getColumn("category")?.setFilterValue(event.target.value)
        }
        className="max-w-sm shadow-none"
      />
    </div>
  )
}