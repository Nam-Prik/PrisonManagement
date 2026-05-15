import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/layout/AppLayout/AppLayout'
import MaintenanceForm from './pages/maintenance/MaintenanceForm'
import MaintenanceList from './pages/maintenance/MaintenanceList'
import CostByLocation from './pages/reports/maintenance/CostByLocation'
import LaborByCost from './pages/reports/maintenance/LaborByCost'
import MaintainersBySkill from './pages/reports/maintenance/MaintainersBySkill'
import TreatmentExperience from './pages/reports/treatment/TreatmentExperience'
import MedicinePrescription from './pages/reports/treatment/MedicinePrescription'
import NurseWorkload from './pages/reports/treatment/NurseWorkload'

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
        <Route path="/reports/treatment/treatment-experience" element={<TreatmentExperience />} />
        <Route path="/reports/treatment/medicine-prescription" element={<MedicinePrescription />} />
        <Route path="/reports/treatment/nurse-workload" element={<NurseWorkload />} />
      </Route>
    </Routes>
  )
}
