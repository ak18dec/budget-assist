// import { fmtDateTime, fmtCurrency } from "@/utils/Formatters"

// export const columns = [
//   {
//     accessorKey: "name",
//     header: "Transaction",
//     cell: ({ row }) => {
//       const tx = row.original

//       return (
//         <div className="flex items-center gap-3">
//           <div className="flex size-9 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
//             {(tx.name || "?").slice(0, 1)}
//           </div>

//           <div>
//             <p className="text-sm font-medium leading-none">{tx.name}</p>
//             <p className="text-xs text-muted-foreground">{tx.category}</p>
//           </div>
//         </div>
//       )
//     },
//   },

//   {
//     accessorKey: "date",
//     header: "Date",
//     cell: ({ row }) => (
//       <span className="text-sm text-muted-foreground">
//         {fmtDateTime(row.getValue("date"))}
//       </span>
//     ),
//   },

//   {
//     accessorKey: "amount",
//     header: "Amount",
//     cell: ({ row }) => {
//       const amount = row.getValue("amount")

//       return (
//         <div
//           className={`text-right text-sm font-medium ${
//             amount >= 0
//               ? "text-emerald-600 dark:text-emerald-400"
//               : "text-destructive"
//           }`}
//         >
//           {fmtCurrency(amount)}
//         </div>
//       )
//     },
//   },
// ]

import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { fmtCurrency, fmtDateTime } from "@/utils/Formatters"

export const columns = [
  {
    accessorKey: "name",
    header: "Transaction",
    cell: ({ row }) => {
      const tx = row.original
      const isIncome = tx.amount >= 0

      return (
        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 items-center justify-center rounded-md ${
              isIncome
                ? "bg-emerald-100 text-emerald-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isIncome ? (
              <ArrowDownLeft size={16} />
            ) : (
              <ArrowUpRight size={16} />
            )}
          </div>

          <div>
            <p className="text-sm font-medium">{tx.name}</p>
            <p className="text-xs text-muted-foreground">{tx.category}</p>
          </div>
        </div>
      )
    },
  },

  {
    id: "status",
    accessorFn: (row) => (row.amount >= 0 ? "income" : "expense"),
    header: "Status",
    cell: ({ row }) => {
      const amount = row.getValue("amount")
      const isIncome = amount >= 0

      return (
        <Badge variant={isIncome ? "default" : "destructive"}>
          {isIncome ? "Income" : "Expense"}
        </Badge>
      )
    },
  },

  {
    accessorKey: "date",
    header: "Date",

    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {fmtDateTime(row.getValue("date"))}
      </span>
    ),
  },

  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") ?? 0

      return (
        <div
          className={`text-right text-sm font-medium ${
            amount >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive"
          }`}
        >
          {fmtCurrency(amount)}
        </div>
      )
    },
  },
]