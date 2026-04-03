// import {useEffect, useState} from 'react'
// import axios from 'axios'
// import TransactionForm from '@/pages/transactions/TransactionForm.jsx'
// import { fmtDateTime, fmtCurrency, capitalize } from '../../utils/Formatters.js'
// import { FiChevronUp, FiChevronDown } from 'react-icons/fi'
// import './TransactionList.css'

// const API_URL = import.meta.env.VITE_API_URL || '';

// function SortIcon({ active, dir }) {
//   if (!active) return <FiChevronUp opacity={0.3} size={14} />
//   return dir === 'asc'
//     ? <FiChevronUp size={14} />
//     : <FiChevronDown size={14} />
// }

// export default function TransactionList(){
//   const [items, setItems] = useState([])
//   const [filter, setFilter] = useState('ALL')
//   const [sort, setSort] = useState({
//     key: 'date',   // 'date' | 'amount'
//     dir: 'desc'    // 'asc' | 'desc'
//   })

//   async function load(){
//     try{
//       const res = await axios.get(`${API_URL}/transactions/`)
//       const data = res.data
//       if (Array.isArray(data)) setItems(data)
//       else if (data?.transactions) setItems(data.transactions)
//       else setItems([])
//     }catch{
//       setItems([])
//     }
//   }

//   useEffect(()=>{
//     load()
//     window.addEventListener('transactions:changed', load)
//     return ()=> window.removeEventListener('transactions:changed', load)
//   }, [])

//   const visibleItems = filter === 'ALL' ? items : items.filter(tx => tx.type === filter)

//   const sortedItems = [...visibleItems].sort((a, b) => {
//     let diff = 0
//     if (sort.key === 'amount') {
//       diff = Math.abs(a.amount) - Math.abs(b.amount)
//     } else {
//       diff = new Date(a.date) - new Date(b.date)
//     }
//     return sort.dir === 'asc' ? diff : -diff
//   })

//   function toggleSort(key) {
//     setSort(prev => ({
//       key,
//       dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc'
//     }))
//   }

//   return (
//     <div className="card transaction-wrapper">
//       <div className="transactions-header">
//         <h3>Transactions</h3>
//       </div>

//       <TransactionForm />

//       <div className="card transaction-list">
//         {items.length === 0 && (
//           <div className="muted empty-state">No transactions yet</div>
//         )}

//         {items.length > 0 && (
//           <>
//           <div className="transaction-row header grid-3">
//             <div>Category</div>
//             <div className="tx-date tx-header-sort" onClick={() => toggleSort('date')}>
//               Date
//               <SortIcon
//                 active={sort.key === 'date'}
//                 dir={sort.dir}
//               />
//             </div>
//             <div className="tx-amount tx-header-sort right" onClick={() => toggleSort('amount')} style={{fontWeight: 500}}>
//               Amount
//               <SortIcon
//                 active={sort.key === 'amount'}
//                 dir={sort.dir}
//               />
//             </div>
//           </div>
//           <div className="tx-filters">
//             {['ALL', 'INCOME', 'EXPENSE'].map(t => (
//               <button
//                 key={t}
//                 className={`tx-filter ${filter === t ? 'active' : ''}`}
//                 onClick={() => setFilter(t)}
//               >
//                 {capitalize(t)}
//               </button>
//             ))}
//           </div>
//           {sortedItems.map(tx => (
//           <div key={tx.id} className="transaction-row grid-3">
//             {/* Left */}
//             <div className="tx-left">
//               <div className="tx-avatar">
//                 {(capitalize(tx.category) || '?').slice(0,1)}
//               </div>
//               <div>
//                 <div className="tx-title">{capitalize(tx.category)}</div>
//                 <div className="tx-sub muted">
//                   {tx.description ? `${tx.description}` : ''}
//                 </div>
//               </div>
//             </div>

//             <div className="tx-date muted">
//               {fmtDateTime(tx.date)}
//             </div>

//             {/* Right */}
//             <div
//               className={`tx-amount ${tx.type === 'EXPENSE' ? 'expense' : 'income'}`}
//             >
//               {fmtCurrency(tx.amount)}
//             </div>
//           </div>
//         ))}
//           </>
//         )}
//       </div>
//     </div>
//   )
// }

import { useEffect, useState } from "react"
import axios from "axios"

import TransactionForm from "@/pages/transactions/TransactionForm.jsx"
import { fmtDateTime, fmtCurrency, capitalize } from "../../utils/Formatters.js"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import { FiChevronUp, FiChevronDown } from "react-icons/fi"
import { BrushCleaning } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || ""

function SortIcon({ active, dir }) {
  if (!active) return <FiChevronUp className="opacity-30 ml-1" size={14} />
  return dir === "asc"
    ? <FiChevronUp className="ml-1" size={14} />
    : <FiChevronDown className="ml-1" size={14} />
}

export default function TransactionList() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState("ALL")
  const [sort, setSort] = useState({
    key: "date",
    dir: "desc"
  })

  async function load() {
    try {
      const res = await axios.get(`${API_URL}/transactions/`)
      const data = res.data

      if (Array.isArray(data)) setItems(data)
      else if (data?.transactions) setItems(data.transactions)
      else setItems([])
    } catch {
      setItems([])
    }
  }

  useEffect(() => {
    load()
    window.addEventListener("transactions:changed", load)
    return () => window.removeEventListener("transactions:changed", load)
  }, [])

  const visibleItems = filter === "ALL" ? items : items.filter(tx => tx.type === filter)
  const sortedItems = [...visibleItems].sort((a, b) => {
    let diff = 0
    if (sort.key === "amount") {
      diff = Math.abs(a.amount) - Math.abs(b.amount)
    } else {
      diff = new Date(a.date) - new Date(b.date)
    }
    return sort.dir === "asc" ? diff : -diff
  })

  function toggleSort(key) {
    setSort(prev => ({
      key,
      dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc"
    }))
  }

  return (
    <div className="space-y-6 p-3">
      <TransactionForm />
      <Card>
        <CardContent>
          {items.length === 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BrushCleaning />
                </EmptyMedia>
                <EmptyTitle>No Transactions Yet</EmptyTitle>
                <EmptyDescription className="max-w-xs text-pretty">
                  You haven&apos;t added any transactions yet. Get started by adding
                  your first transaction.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row justify-center gap-2">
                
              </EmptyContent>
            </Empty>
          )}
          {items.length > 0 && (
            <>
              <div className="flex gap-2 mb-4 mt-4">
                {["ALL", "INCOME", "EXPENSE"].map(t => (
                  <Button
                    key={t}
                    size="sm"
                    variant={filter === t ? "default" : "outline"}
                    onClick={() => setFilter(t)}
                  >
                    {capitalize(t)}
                  </Button>
                ))}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort("date")}
                    >
                      <div className="flex items-center">
                        Date
                        <SortIcon
                          active={sort.key === "date"}
                          dir={sort.dir}
                        />
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer"
                      onClick={() => toggleSort("amount")}
                    >
                      <div className="flex items-center justify-end">
                        Amount
                        <SortIcon
                          active={sort.key === "amount"}
                          dir={sort.dir}
                        />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map(tx => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {(capitalize(tx.category) || "?").slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-medium">
                              {capitalize(tx.category)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {tx.description || ""}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmtDateTime(tx.date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={tx.type === "EXPENSE" ? "destructive" : "secondary"}
                        >
                          {fmtCurrency(tx.amount)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}