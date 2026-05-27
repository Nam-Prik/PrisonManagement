import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/layout/AppLayout/AppLayout'
import IncidentForm from './pages/incident/IncidentForm'
import IncidentList from './pages/incident/IncidentList'
import IrregularityForm from './pages/irregularity/IrregularityForm'
import IrregularityList from './pages/irregularity/IrregularityList'
import MaintainerForm from './pages/maintainer/MaintainerForm'
import MaintainerList from './pages/maintainer/MaintainerList'
import MaintenanceForm from './pages/maintenance/MaintenanceForm'
import MaintenanceList from './pages/maintenance/MaintenanceList'
import MedicineForm from './pages/medicine/MedicineForm'
import MedicineList from './pages/medicine/MedicineList'
import NurseForm from './pages/nurse/NurseForm'
import NurseList from './pages/nurse/NurseList'
import OfficerForm from './pages/officer/OfficerForm'
import OfficerList from './pages/officer/OfficerList'
import PersonForm from './pages/person/PersonForm'
import PersonList from './pages/person/PersonList'
import PrisonLocationForm from './pages/prison-location/PrisonLocationForm'
import PrisonLocationList from './pages/prison-location/PrisonLocationList'
import PrisonerForm from './pages/prisoner/PrisonerForm'
import PrisonerIntakeEdit from './pages/prisoner/PrisonerIntakeEdit'
import PrisonerIntakeForm from './pages/prisoner/PrisonerIntakeForm'
import PrisonerIntakeList from './pages/prisoner/PrisonerIntakeList'
import PrisonerList from './pages/prisoner/PrisonerList'
import IncidentsByOfficer from './pages/reports/incident/IncidentsByOfficer'
import InvolvedPrisonersByLocation from './pages/reports/incident/InvolvedPrisonersByLocation'
import TopPrisonersByLocation from './pages/reports/incident/TopPrisonersByLocation'
import CostByLocation from './pages/reports/maintenance/CostByLocation'
import LaborByCost from './pages/reports/maintenance/LaborByCost'
import MaintainersBySkill from './pages/reports/maintenance/MaintainersBySkill'
import ConfiscatedItems from './pages/reports/prisonerintake/ConfiscatedItems'
import IntakeByDateRange from './pages/reports/prisonerintake/IntakeByDateRange'
import TotalItemsAnalysis from './pages/reports/prisonerintake/TotalItemsAnalysis'
import MedicinePrescription from './pages/reports/treatment/MedicinePrescription'
import NurseWorkload from './pages/reports/treatment/NurseWorkload'
import TreatmentExperience from './pages/reports/treatment/TreatmentExperience'
import VisitationAnalysis from './pages/reports/visitation/VisitationAnalysis'
import VisitationLogs from './pages/reports/visitation/VisitationLogs'
import VisitorRelationship from './pages/reports/visitation/VisitorRelationship'
import TreatmentForm from './pages/treatment/TreatmentForm'
import TreatmentList from './pages/treatment/TreatmentList'
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

        <Route path="/incident" element={<IncidentList />} />
        <Route path="/incident/new" element={<IncidentForm />} />
        <Route path="/incident/:id" element={<IncidentForm />} />

        <Route path="/prisoner-intake" element={<PrisonerIntakeList />} />
        <Route path="/prisoner-intake/new" element={<PrisonerIntakeForm />} />
        <Route path="/prisoner-intake/:id" element={<PrisonerIntakeEdit />} />

        <Route path="/visitation" element={<VisitmentList />} />
        <Route path="/visitation/new" element={<VisitmentForm />} />
        <Route path="/visitation/edit/:id" element={<VisitmentForm />} />

        <Route path="/treatment" element={<TreatmentList />} />
        <Route path="/treatment/new" element={<TreatmentForm />} />
        <Route path="/treatment/:id" element={<TreatmentForm />} />

        <Route path="/person" element={<PersonList />} />
        <Route path="/person/new" element={<PersonForm />} />
        <Route path="/person/:id" element={<PersonForm />} />

        <Route path="/prisoner" element={<PrisonerList />} />
        <Route path="/prisoner/new" element={<PrisonerForm />} />
        <Route path="/prisoner/:id" element={<PrisonerForm />} />

        <Route path="/prison-location" element={<PrisonLocationList />} />
        <Route path="/prison-location/new" element={<PrisonLocationForm />} />
        <Route path="/prison-location/:id" element={<PrisonLocationForm />} />

        <Route path="/medicine" element={<MedicineList />} />
        <Route path="/medicine/new" element={<MedicineForm />} />
        <Route path="/medicine/:id" element={<MedicineForm />} />

        <Route path="/officer" element={<OfficerList />} />
        <Route path="/officer/new" element={<OfficerForm />} />
        <Route path="/officer/:id" element={<OfficerForm />} />

        <Route path="/nurse" element={<NurseList />} />
        <Route path="/nurse/new" element={<NurseForm />} />
        <Route path="/nurse/:id" element={<NurseForm />} />

        <Route path="/maintainer" element={<MaintainerList />} />
        <Route path="/maintainer/new" element={<MaintainerForm />} />
        <Route path="/maintainer/:id" element={<MaintainerForm />} />

        <Route path="/irregularity" element={<IrregularityList />} />
        <Route path="/irregularity/new" element={<IrregularityForm />} />
        <Route path="/irregularity/:id" element={<IrregularityForm />} />

        <Route path="/reports/maintenance/maintainers-by-skill" element={<MaintainersBySkill />} />
        <Route path="/reports/maintenance/labor-by-cost" element={<LaborByCost />} />
        <Route path="/reports/maintenance/cost-by-location" element={<CostByLocation />} />
        <Route
          path="/reports/visitation/visitor-prisoner-relationship"
          element={<VisitorRelationship />}
        />
        <Route path="/reports/visitation/visitation-logs" element={<VisitationLogs />} />
        <Route path="/reports/visitation/visitation-analysis" element={<VisitationAnalysis />} />
        <Route path="/reports/incident/by-officer" element={<IncidentsByOfficer />} />
        <Route path="/reports/incident/by-location" element={<InvolvedPrisonersByLocation />} />
        <Route path="/reports/incident/top-by-location" element={<TopPrisonersByLocation />} />
        <Route path="/reports/prisoner-intake/by-date" element={<IntakeByDateRange />} />
        <Route path="/reports/prisoner-intake/confiscated-items" element={<ConfiscatedItems />} />
        <Route path="/reports/prisoner-intake/total-items" element={<TotalItemsAnalysis />} />
        <Route path="/reports/treatment/experience" element={<TreatmentExperience />} />
        <Route path="/reports/treatment/medicine-prescription" element={<MedicinePrescription />} />
        <Route path="/reports/treatment/nurse-workload" element={<NurseWorkload />} />
      </Route>
    </Routes>
  )
}
