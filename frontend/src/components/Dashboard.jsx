import { useEffect, useState } from "react"
import SummaryCards from '../components/SummaryCards'
import FinancialChart from '../components/FinancialChart'
import RecentTransactions from '../components/RecentTransactions'
import SavingsList from '../components/SavingsList'
import { FiInfo } from 'react-icons/fi'
import { rangeToQuery } from '../utils/Formatters.js'

const API_URL = import.meta.env.VITE_API_URL || '';

export default function DashboardPage() {
  const [range, setRange] = useState("THIS_YEAR")
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const { from, to } = rangeToQuery(range)
    fetch(`${API_URL}/summary/financial-chart?start=${from}&end=${to}`)
      .then(res => res.json())
      .then(setChartData)
      .catch(console.error)
  }, [range])

  return (
    <>
      <div className="card" style={{ marginBottom: 12 }}>
        <SummaryCards />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div className="card">
          <FinancialChart
            data={chartData}
            range={range}
            onRangeChange={setRange}
          />
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 500 }}>
            Savings <FiInfo size={15} />
          </h3>
          <SavingsList />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginTop: 12 }}>
        <div className="card">
          <RecentTransactions />
        </div>

        {/* <div className="card">
          <h3 style={{ fontWeight: 500 }}>
            Savings <FiInfo size={15} />
          </h3>
          <SavingsList />
        </div> */}
      </div>
    </>
  )
}
