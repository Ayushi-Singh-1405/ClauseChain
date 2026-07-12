import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "@/components/layout/layout"
import HomePage from "@/pages/home"
import DashboardPage from "@/pages/dashboard"
import CircularsPage from "@/pages/circulars"
import RuleReviewPage from "@/pages/rule-review"
import RegisterPage from "@/pages/register"
import TasksPage from "@/pages/tasks"
import EvidencePage from "@/pages/evidence"
import AuditPage from "@/pages/audit"
import CopilotPage from "@/pages/copilot"
import SettingsPage from "@/pages/settings"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/circulars" element={<CircularsPage />} />
          <Route path="/rule-review" element={<RuleReviewPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/evidence" element={<EvidencePage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/copilot" element={<CopilotPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App