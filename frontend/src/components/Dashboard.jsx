import SummaryCards from '../components/SummaryCards'
import FinancialChart from '../components/FinancialChart'
import RecentTransactions from '../components/RecentTransactions'
import SavingsList from '../components/SavingsList'
import { FiInfo } from 'react-icons/fi'

export default function DashboardPage() {
  return (
    <>
      <div className="card" style={{ marginBottom: 12 }}>
        <SummaryCards />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div className="card">
          <FinancialChart />
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
