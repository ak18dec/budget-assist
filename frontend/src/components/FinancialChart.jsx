// import {useMemo, useState, useRef, useEffect} from 'react'
// import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'
// import { FiInfo, FiArrowUp, FiArrowDown, FiChevronUp, FiChevronDown } from 'react-icons/fi'
// import { fmtCurrency } from '../utils/Formatters.js'

// function YAxisFormatter(value){
//   return `₹${(value/1000).toFixed(0)}K`
// }

// function RangeDropdown({ value, onChange }) {
//   const [open, setOpen] = useState(false)
//   const ref = useRef(null)

//   const OPTIONS = [
//     { label: "This year", value: "THIS_YEAR" },
//     { label: "Last year", value: "LAST_YEAR" },
//     { label: "Last 5 years", value: "LAST_5_YEARS" },
//   ]

//   const selected = OPTIONS.find(o => o.value === value)

//   useEffect(() => {
//     function onClickOutside(e) {
//       if (ref.current && !ref.current.contains(e.target)) {
//         setOpen(false)
//       }
//     }
//     document.addEventListener("mousedown", onClickOutside)
//     return () => document.removeEventListener("mousedown", onClickOutside)
//   }, [])

//   return (
//     <div className="range-dropdown" ref={ref}>
//       <button
//         className="range-trigger"
//         onClick={() => setOpen(o => !o)}
//         aria-haspopup="listbox"
//         aria-expanded={open}
//       >
//         <span>{selected?.label}</span>
//         {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
//       </button>

//       {open && (
//         <div className="range-menu" role="listbox">
//           {OPTIONS.map(opt => (
//             <button
//               key={opt.value}
//               className={`range-item ${opt.value === value ? "active" : ""}`}
//               onClick={() => {
//                 onChange(opt.value)
//                 setOpen(false)
//               }}
//               role="option"
//               aria-selected={opt.value === value}
//             >
//               {opt.label}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// function CustomTooltip({active, payload, label}){
//   if(!active || !payload || !payload.length) return null
//   const incomeEntry = payload.find(p=>p.dataKey==='income')
//   const expenseEntry = payload.find(p=>p.dataKey==='expense')
//   const income = incomeEntry?.value || 0
//   const expense = expenseEntry?.value || 0
//   const incomeDelta = incomeEntry?.payload?.incomeDelta ?? 0
//   const expenseDelta = expenseEntry?.payload?.expenseDelta ?? 0

//   const Delta = ({val})=>{
//     if(val===0) return <span className="muted">0%</span>
//     const up = val>0
//     return <span className={up? 'delta-up': 'delta-down'} style={{fontSize:12}}>{up? <FiArrowUp />:<FiArrowDown />} {Math.abs(val)}%</span>
//   }

//   return (
//     <div className="chart-tooltip card" style={{padding:12, minWidth:180, paddingLeft:10}}>
//       <div style={{fontSize:12, fontWeight:'550',color:'#6b7280', marginBottom:6}}>{label} 2025</div>
//       <div style={{ display:'flex', gap:8}}>
//         <div style={{width:4, height:40, backgroundColor:'var(--accent)', borderRadius:5}}></div>
//         <div style={{display:'flex', flexDirection:'column', justifyContent:'space-between', gap:4}}>
//           <div>
//             <div style={{fontWeight:550}}>{fmtCurrency(income)}</div>
//           </div>
//           <div style={{textAlign:'left', display:'flex', flexDirection:'row', alignItems:'flex-end', gap:4}}>
//             <Delta val={incomeDelta} /><div className="muted" style={{fontSize:12}}>vs last month</div></div>
//         </div>
//       </div>
//       <div style={{height:10}} />
//       <div style={{ display:'flex', gap:8}}>
//         <div style={{width:4, height:40, backgroundColor:'var(--muted-blue)', borderRadius:5}}></div>
//         <div style={{display:'flex', flexDirection:'column', justifyContent:'space-between', gap:4}}>
//           <div>
//             <div style={{fontWeight:550}}>{fmtCurrency(expense)}</div>
//           </div>
//           <div style={{textAlign:'left', display:'flex', flexDirection:'row', alignItems:'flex-end', gap:4}}>
//             <Delta val={expenseDelta} /><div className="muted" style={{fontSize:12}}>vs last month</div></div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default function FinancialChart({ data, range, onRangeChange }){
//   const [selectedMonth, setSelectedMonth] = useState(null)
//   const d = data || sampleData

//   // compute simple percent deltas for tooltip hints (income vs previous month)
//   const withDelta = useMemo(()=>{
//     return d.map((row,i)=>{
//       const prev = d[i-1]||{income:0,expense:0}
//       const incomeDelta = prev.income? Math.round((row.income - prev.income)/prev.income*100) : 0
//       const expenseDelta = prev.expense? Math.round((row.expense - prev.expense)/prev.expense*100) : 0
//       return {...row, incomeDelta, expenseDelta}
//     })
//   },[d])

//   const handleBarClick = (data) => {
//     if(!data || !data.month) return
//     setSelectedMonth(prev => prev===data.month? null : data.month)
//   }

//   const maxYAxis = useMemo(() => {
//     const allValues = d.flatMap(row => [row.income, row.expense])
//     const maxValue = allValues.length ? Math.max(...allValues) : 20000
//     return Math.max(maxValue, 20000) // ensure at least 20000
//   }, [d])

//   return (
//     <div>
//       <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
//         <div style={{display:'flex', alignItems:'center', gap:6, fontWeight:500}}>Financial Insights <FiInfo color='var(--muted-gray)' size={15} /></div>
//         <div style={{display:'flex', gap:12, alignItems:'center'}}>
//           <div style={{display:'flex', gap:8, alignItems:'center'}}><div style={{width:8,height:8,background:'var(--accent)',borderRadius:5}} /> <div className="muted">Income</div></div>
//           <div style={{display:'flex', gap:8, alignItems:'center'}}><div style={{width:8,height:8,background:'var(--muted-blue)',borderRadius:5}} /> <div className="muted">Expense</div></div>
//           <RangeDropdown
//             value={range}
//             onChange={onRangeChange}
//           />
//         </div>
//       </div>

//       <div style={{width: '100%', height: 300}}>
//         <ResponsiveContainer>
//           <BarChart data={withDelta} margin={{top: 10, right: 8, left: 0, bottom: 0}}>
//             <CartesianGrid horizontal={true} vertical={false} strokeDasharray="6 6" stroke="var(--border-lighter)" />
//             <XAxis
//               dataKey="month"
//               tick={{fill:'var(--muted)', fontSize:12}}
//               axisLine={{ stroke: 'var(--border-lighter)', strokeWidth: 1 }}
//               tickLine={false}
//             />
//             <YAxis 
//               axisLine={false} 
//               tickLine={false} 
//               tick={{fill:'var(--muted)', fontSize:12}} 
//               tickFormatter={v => YAxisFormatter(v)} 
//               domain={[0, maxYAxis]}
//             />
//             <Tooltip content={<CustomTooltip/>} />
//             <Bar 
//               dataKey="income" 
//               barSize={18} 
//               radius={[3,3,0,0]}
//               isAnimationActive={range === "THIS_YEAR"}
//               animationDuration={600}
//               animationEasing="ease-out" 
//               onClick={handleBarClick}>
//               {withDelta.map((entry, idx) => (
//                 <Cell key={`income-${idx}`} fill={entry.month===selectedMonth? 'var(--accent-strong)' : 'var(--accent)'} style={entry.month===selectedMonth? {filter:'drop-shadow(0 6px 18px rgba(10,132,255,0.18))'}:{}} />
//               ))}
//             </Bar>
//             <Bar 
//               dataKey="expense" 
//               barSize={18} 
//               radius={[3,3,0,0]}
//               isAnimationActive={range === "THIS_YEAR"}
//               animationDuration={600}
//               animationEasing="ease-out"
//               onClick={handleBarClick}>
//               {withDelta.map((entry, idx) => (
//                 <Cell key={`exp-${idx}`} fill={entry.month===selectedMonth? 'rgba(10,132,255,0.08)' : 'var(--muted-blue)'} />
//               ))}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   )
// }

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

import {useMemo, useState, useRef, useEffect} from 'react'

// export const description = "An interactive area chart"

const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
  { date: "2024-04-20", desktop: 89, mobile: 150 },
  { date: "2024-04-21", desktop: 137, mobile: 200 },
  { date: "2024-04-22", desktop: 224, mobile: 170 },
  { date: "2024-04-23", desktop: 138, mobile: 230 },
  { date: "2024-04-24", desktop: 387, mobile: 290 },
  { date: "2024-04-25", desktop: 215, mobile: 250 },
  { date: "2024-04-26", desktop: 75, mobile: 130 },
  { date: "2024-04-27", desktop: 383, mobile: 420 },
  { date: "2024-04-28", desktop: 122, mobile: 180 },
  { date: "2024-04-29", desktop: 315, mobile: 240 },
  { date: "2024-04-30", desktop: 454, mobile: 380 },
  { date: "2024-05-01", desktop: 165, mobile: 220 },
  { date: "2024-05-02", desktop: 293, mobile: 310 },
  { date: "2024-05-03", desktop: 247, mobile: 190 },
  { date: "2024-05-04", desktop: 385, mobile: 420 },
  { date: "2024-05-05", desktop: 481, mobile: 390 },
  { date: "2024-05-06", desktop: 498, mobile: 520 },
  { date: "2024-05-07", desktop: 388, mobile: 300 },
  { date: "2024-05-08", desktop: 149, mobile: 210 },
  { date: "2024-05-09", desktop: 227, mobile: 180 },
  { date: "2024-05-10", desktop: 293, mobile: 330 },
  { date: "2024-05-11", desktop: 335, mobile: 270 },
  { date: "2024-05-12", desktop: 197, mobile: 240 },
  { date: "2024-05-13", desktop: 197, mobile: 160 },
  { date: "2024-05-14", desktop: 448, mobile: 490 },
  { date: "2024-05-15", desktop: 473, mobile: 380 },
  { date: "2024-05-16", desktop: 338, mobile: 400 },
  { date: "2024-05-17", desktop: 499, mobile: 420 },
  { date: "2024-05-18", desktop: 315, mobile: 350 },
  { date: "2024-05-19", desktop: 235, mobile: 180 },
  { date: "2024-05-20", desktop: 177, mobile: 230 },
  { date: "2024-05-21", desktop: 82, mobile: 140 },
  { date: "2024-05-22", desktop: 81, mobile: 120 },
  { date: "2024-05-23", desktop: 252, mobile: 290 },
  { date: "2024-05-24", desktop: 294, mobile: 220 },
  { date: "2024-05-25", desktop: 201, mobile: 250 },
  { date: "2024-05-26", desktop: 213, mobile: 170 },
  { date: "2024-05-27", desktop: 420, mobile: 460 },
  { date: "2024-05-28", desktop: 233, mobile: 190 },
  { date: "2024-05-29", desktop: 78, mobile: 130 },
  { date: "2024-05-30", desktop: 340, mobile: 280 },
  { date: "2024-05-31", desktop: 178, mobile: 230 },
  { date: "2024-06-01", desktop: 178, mobile: 200 },
  { date: "2024-06-02", desktop: 470, mobile: 410 },
  { date: "2024-06-03", desktop: 103, mobile: 160 },
  { date: "2024-06-04", desktop: 439, mobile: 380 },
  { date: "2024-06-05", desktop: 88, mobile: 140 },
  { date: "2024-06-06", desktop: 294, mobile: 250 },
  { date: "2024-06-07", desktop: 323, mobile: 370 },
  { date: "2024-06-08", desktop: 385, mobile: 320 },
  { date: "2024-06-09", desktop: 438, mobile: 480 },
  { date: "2024-06-10", desktop: 155, mobile: 200 },
  { date: "2024-06-11", desktop: 92, mobile: 150 },
  { date: "2024-06-12", desktop: 492, mobile: 420 },
  { date: "2024-06-13", desktop: 81, mobile: 130 },
  { date: "2024-06-14", desktop: 426, mobile: 380 },
  { date: "2024-06-15", desktop: 307, mobile: 350 },
  { date: "2024-06-16", desktop: 371, mobile: 310 },
  { date: "2024-06-17", desktop: 475, mobile: 520 },
  { date: "2024-06-18", desktop: 107, mobile: 170 },
  { date: "2024-06-19", desktop: 341, mobile: 290 },
  { date: "2024-06-20", desktop: 408, mobile: 450 },
  { date: "2024-06-21", desktop: 169, mobile: 210 },
  { date: "2024-06-22", desktop: 317, mobile: 270 },
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
}

export default function FinancialChart() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = useState("90d")

  useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Visitors</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        {/* <CardFooter> */}
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        {/* </CardFooter> */}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
