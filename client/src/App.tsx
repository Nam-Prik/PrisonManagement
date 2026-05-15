import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/layout/AppLayout/AppLayout'
import MaintenanceForm from './pages/maintenance/MaintenanceForm'
import MaintenanceList from './pages/maintenance/MaintenanceList'
import CostByLocation from './pages/reports/maintenance/CostByLocation'
import LaborByCost from './pages/reports/maintenance/LaborByCost'
import MaintainersBySkill from './pages/reports/maintenance/MaintainersBySkill'
import VisitationAnalysis from './pages/reports/visitation/VisitationAnalysis'
import VisitationLogs from './pages/reports/visitation/VisitationLogs'
import VisitorRelationship from './pages/reports/visitation/VisitorRelationship'
import VisitmentForm from './pages/visitation/VisitmentForm'
import VisitmentList from './pages/visitation/VisitmentList'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/maintenance" replace />} />
        <Route path="/maintenance" element={<MaintenanceList />} />
        <Route path="/maintenance/new" element={<MaintenanceForm />} />
        <Route path="/maintenance/:id" element={<MaintenanceForm />} />
        <Route path="/reports/maintenance/maintainers-by-skill" element={<MaintainersBySkill />} />
        <Route path="/reports/maintenance/labor-by-cost" element={<LaborByCost />} />
        <Route path="/reports/maintenance/cost-by-location" element={<CostByLocation />} />
        <Route
          path="/reports/visitation/visitor-prisoner-relationship"
          element={<VisitorRelationship />}
        />
        <Route path="/reports/visitation/visitation-logs" element={<VisitationLogs />} />
        <Route path="/reports/visitation/visitation-analysis" element={<VisitationAnalysis />} />
        <Route path="/visitation" element={<VisitmentList />} />
        <Route path="/visitation/new" element={<VisitmentForm />} />
        <Route path="/visitation/edit/:id" element={<VisitmentForm />} />
      </Route>
    </Routes>
  )
}
