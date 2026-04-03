// import {useEffect, useState} from 'react'
// import axios from 'axios'
// import { FiInfo } from 'react-icons/fi'
// import { fmtDateTime, fmtCurrency } from '../utils/Formatters.js'

// const API_URL = import.meta.env.VITE_API_URL || '';

// const DUMMY = [
//   {id: 't1', name: 'Paypal', category: 'Income', account: 'Platinum', date: '2023-08-08T05:02:00Z', amount: 1240.41},
//   {id: 't2', name: 'Netflix', category: 'Entertainment', account: 'Regular', date: '2023-08-08T14:16:00Z', amount: -15.49},
//   {id: 't3', name: 'Notion', category: 'Productivity', account: 'Platinum', date: '2023-08-07T18:01:00Z', amount: -9.72},
//   {id: 't4', name: 'Stripe', category: 'Income', account: 'Business', date: '2023-08-06T09:10:00Z', amount: 320.00},
// ]

// export default function RecentTransactions(){
//   const [items, setItems] = useState(DUMMY)

//   useEffect(()=>{
//     let mounted = true
//     async function load(){
//       try{
//         const res = await axios.post(`${API_URL}/transactions/`, {amount: parseFloat(amount), category, description, date})
//         const rows = Array.isArray(res.data)? res.data : (res.data.transactions||res.data.items||[])
//         if(mounted && rows.length) setItems(rows.slice(0,8))
//       }catch(e){ /* keep dummy data */ }
//     }
//     load()
//     return ()=> { mounted = false }
//   }, [])

//   return (
//     <div>
//       <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
//         <h3 style={{marginTop:0, fontWeight: 500}}>Recent Transactions <FiInfo color='var(--muted-gray)' size={15} /></h3>
//         <div className="muted">Last 30 days</div>
//       </div>

//       <div style={{display:'flex', flexDirection:'column', gap:12}}>
//         {items.map(tx=> (
//           <div key={tx.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 6px', borderBottom:'1px solid #f1f5f9'}}>
//             <div style={{display:'flex', alignItems:'center', gap:12}}>
//               <div style={{width:40, height:40, borderRadius:10, background:'#fff', boxShadow:'0 1px 2px rgba(0,0,0,0.03)', display:'flex', alignItems:'center', justifyContent:'center'}}>
//                 <div style={{fontWeight:500, color:'#334155'}}>{(tx.name||'?').slice(0,1)}</div>
//               </div>
//               <div>
//                 <div style={{fontWeight:500, fontSize: 13}}>{tx.name}</div>
//                 <div className="muted" style={{fontSize:12}}>{tx.category}</div>
//               </div>
//             </div>

//             <div style={{display:'flex', gap:24, alignItems:'center', minWidth:340, justifyContent:'flex-end'}}>
//               {/* <div style={{width:120, textAlign:'left'}} className="muted">{tx.account || '—'}</div> */}
//               <div className="muted" style={{width:140, textAlign:'left'}}>{fmtDateTime(tx.date)}</div>
//               <div style={{width:120, textAlign:'right', fontWeight:500, fontSize:13, color: tx.amount >= 0 ? '#159969' : '#d62929'}}>{fmtCurrency(tx.amount)}</div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// import { useEffect, useState } from "react"
// import axios from "axios"
// import { FiInfo } from "react-icons/fi"

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// import { fmtDateTime, fmtCurrency } from "../utils/Formatters.js"

// const API_URL = import.meta.env.VITE_API_URL || ""

// const DUMMY = [
//   { id: "t1", name: "Paypal", category: "Income", account: "Platinum", date: "2023-08-08T05:02:00Z", amount: 1240.41 },
//   { id: "t2", name: "Netflix", category: "Entertainment", account: "Regular", date: "2023-08-08T14:16:00Z", amount: -15.49 },
//   { id: "t3", name: "Notion", category: "Productivity", account: "Platinum", date: "2023-08-07T18:01:00Z", amount: -9.72 },
//   { id: "t4", name: "Stripe", category: "Income", account: "Business", date: "2023-08-06T09:10:00Z", amount: 320.0 },
// ]

// export default function RecentTransactions() {
//   const [items, setItems] = useState(DUMMY)

//   useEffect(() => {
//     let mounted = true

//     async function load() {
//       try {
//         const res = await axios.get(`${API_URL}/transactions`)
//         const rows = Array.isArray(res.data)
//           ? res.data
//           : res.data.transactions || res.data.items || []

//         if (mounted && rows.length) setItems(rows.slice(0, 8))
//       } catch (e) {
//         /* keep dummy data */
//       }
//     }

//     load()

//     return () => {
//       mounted = false
//     }
//   }, [])

//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between pb-4">
//         <CardTitle className="flex items-center gap-2 text-base font-medium">
//           Recent Transactions
//           <FiInfo className="text-muted-foreground" size={14} />
//         </CardTitle>

//         <span className="text-xs text-muted-foreground">Last 30 days</span>
//       </CardHeader>

//       <CardContent className="space-y-3">
//         {items.map((tx) => (
//           <div
//             key={tx.id}
//             className="flex items-center justify-between border-b border-border py-3"
//           >
//             {/* LEFT SIDE */}
//             <div className="flex items-center gap-3">
//               <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
//                 {(tx.name || "?").slice(0, 1)}
//               </div>

//               <div>
//                 <p className="text-sm font-medium">{tx.name}</p>
//                 <p className="text-xs text-muted-foreground">{tx.category}</p>
//               </div>
//             </div>

//             {/* RIGHT SIDE */}
//             <div className="flex items-center gap-6 text-sm">
//               <span className="w-[140px] text-muted-foreground">
//                 {fmtDateTime(tx.date)}
//               </span>

//               <span
//                 className={`w-[110px] text-right font-medium ${
//                   tx.amount >= 0
//                     ? "text-emerald-600 dark:text-emerald-400"
//                     : "text-destructive"
//                 }`}
//               >
//                 {fmtCurrency(tx.amount)}
//               </span>
//             </div>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   )
// }

// import { useEffect, useState } from "react"
// import axios from "axios"

// import { DataTable } from "./DataTable"
// import { columns } from "./columns"

// const API_URL = import.meta.env.VITE_API_URL || ""

// const DUMMY = [
//   { id: "t1", name: "Paypal", category: "Income", date: "2023-08-08T05:02:00Z", amount: 1240.41 },
//   { id: "t2", name: "Netflix", category: "Entertainment", date: "2023-08-08T14:16:00Z", amount: -15.49 },
//   { id: "t3", name: "Notion", category: "Productivity", date: "2023-08-07T18:01:00Z", amount: -9.72 },
//   { id: "t4", name: "Stripe", category: "Income", date: "2023-08-06T09:10:00Z", amount: 320.0 },
//   { id: "t5", name: "Amazon", category: "Shopping", date: "2023-08-05T12:30:00Z", amount: -45.99 },
//   { id: "t6", name: "Apple Store", category: "Gadgets", date: "2023-08-04T16:45:00Z", amount: -199.99 },
//   { id: "t7", name: "Uber", category: "Transport", date: "2023-08-03T20:15:00Z", amount: -23.5 },
//   { id: "t8", name: "Starbucks", category: "Food & Drinks", date: "2023-08-02T08:20:00Z", amount: -5.75 },
//   { id: "t9", name: "Google Ads", category: "Marketing", date: "2023-08-01T14:00:00Z", amount: -150.0 },
//   { id: "t10", name: "Freelance", category: "Income", date: "2023-07-31T10:00:00Z", amount: 600.0 },
//   { id: "t11", name: "Spotify", category: "Entertainment", date: "2023-07-30T18:30:00Z", amount: -9.99 },
//   { id: "t12", name: "Electricity Bill", category: "Utilities", date: "2023-07-29T09:00:00Z", amount: -75.0 }
// ]

// export default function RecentTransactions() {
//   const [items, setItems] = useState(DUMMY)

//   useEffect(() => {
//     let mounted = true

//     async function load() {
//       try {
//         const res = await axios.get(`${API_URL}/transactions`)
//         const rows = Array.isArray(res.data)
//           ? res.data
//           : res.data.transactions || res.data.items || []

//         if (mounted && rows.length) setItems(rows.slice(0, 8))
//       } catch (e) {}
//     }

//     load()

//     return () => {
//       mounted = false
//     }
//   }, [])

//   return (
//     <div className="space-y-4">
//       <div>
//         <h3 className="text-base font-semibold">Recent Transactions</h3>
//         <p className="text-sm text-muted-foreground">Last 30 days</p>
//       </div>

//       <DataTable columns={columns} data={items} />
//     </div>
//   )
// }

// import { useEffect, useState } from "react"
// import axios from "axios"

// import { DataTable } from "@/components/datatable/DataTable"
// import { columns } from "./datatable/columns"

// const API_URL = import.meta.env.VITE_API_URL || ""

// const DUMMY = [
//   { id: "t1", name: "Paypal", category: "Income", date: "2023-08-08T05:02:00Z", amount: 1240.41 },
//   { id: "t2", name: "Netflix", category: "Entertainment", date: "2023-08-08T14:16:00Z", amount: -15.49 },
//   { id: "t3", name: "Notion", category: "Productivity", date: "2023-08-07T18:01:00Z", amount: -9.72 },
//   { id: "t4", name: "Stripe", category: "Income", date: "2023-08-06T09:10:00Z", amount: 320.0 },
//   { id: "t5", name: "Amazon", category: "Shopping", date: "2023-08-05T12:30:00Z", amount: -45.99 },
//   { id: "t6", name: "Apple Store", category: "Gadgets", date: "2023-08-04T16:45:00Z", amount: -199.99 },
//   { id: "t7", name: "Uber", category: "Transport", date: "2023-08-03T20:15:00Z", amount: -23.5 },
//   { id: "t8", name: "Starbucks", category: "Food & Drinks", date: "2023-08-02T08:20:00Z", amount: -5.75 },
//   { id: "t9", name: "Google Ads", category: "Marketing", date: "2023-08-01T14:00:00Z", amount: -150.0 },
//   { id: "t10", name: "Freelance", category: "Income", date: "2023-07-31T10:00:00Z", amount: 600.0 },
//   { id: "t11", name: "Spotify", category: "Entertainment", date: "2023-07-30T18:30:00Z", amount: -9.99 },
//   { id: "t12", name: "Electricity Bill", category: "Utilities", date: "2023-07-29T09:00:00Z", amount: -75.0 },
//   { id: "t13", name: "Airbnb", category: "Travel", date: "2023-07-28T15:00:00Z", amount: -250.0 },
//   { id: "t14", name: "GitHub Sponsors", category: "Income", date: "2023-07-27T11:30:00Z", amount: 80.0 },
//   { id: "t15", name: "Grocery Store", category: "Food & Drinks", date: "2023-07-26T17:45:00Z", amount: -120.5 }
// ]

// export default function RecentTransactions() {
//   const [items, setItems] = useState(DUMMY)

//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await axios.get(`${API_URL}/transactions`)
//         const rows =
//           res.data.transactions || res.data.items || res.data || []

//         if (rows.length) setItems(rows)
//       } catch (e) {}
//     }

//     load()
//   }, [])

//   return (
//     <div className="space-y-4">
//       <div>
//         <h3 className="text-lg font-semibold">Recent Transactions</h3>
//         <p className="text-sm text-muted-foreground">Last 30 days</p>
//       </div>

//       <DataTable columns={columns} data={items} />
//     </div>
//   )
// }

import { useEffect, useState } from "react"
import axios from "axios"

import { DataTable } from "@/components/datatable/DataTable"
import { TableSkeleton } from "@/components/datatable/TableSkeleton"
import { columns } from "@/components/datatable/columns"

const API_URL = import.meta.env.VITE_API_URL || ""

export default function RecentTransactions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`${API_URL}/transactions`)
        const rows =
          res.data.transactions || res.data.items || res.data || []

          console.log(rows)

        setItems(rows)
      } catch (e) {
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <TableSkeleton />

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-md font-semibold">Recent Transactions</h3>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </div>

      <DataTable columns={columns} data={items} loading={loading} />
    </div>
  )
}