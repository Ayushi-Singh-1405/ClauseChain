import { create } from "zustand"

// Types
export type ObligationStatus = "Compliant" | "Pending" | "Under Review" | "At Risk" | "Overdue"

export type TaskStatus = "todo" | "in-progress" | "in-review" | "done"

export interface Circular {
  id: string
  title: string
  ref: string
  category: string
  date: string
  impact: "High" | "Medium" | "Low"
  obligations: number
  status: "Under Review" | "Resolved"
}

export interface ExtractedObligation {
  id: string
  regulation: string
  mapping: string | null
  text: string
  confidence: number
  isMapped: boolean
  circularRef: string
  status: "pending" | "approved" | "rejected"
}

export interface ComplianceObligation {
  id: string
  text: string
  circularRef: string
  clause: string
  owner: string
  due: string
  evidence: number
  status: ObligationStatus
}

export interface Task {
  id: string
  priority: "LOW" | "MEDIUM" | "HIGH"
  title: string
  obligation: string
  due: string
  owner: string
  status: TaskStatus
}

export interface Evidence {
  id: string
  filename: string
  size: string
  obligation: string
  uploadedBy: string
  date: string
  hash: string
}

export interface AuditEntry {
  timestamp: string
  actor: string
  isSystem: boolean
  action: string
  entity: string
  ip: string | null
}

// Helpers
function generateHash(): string {
  const chars = "0123456789abcdef"
  let hash = "0x"
  for (let i = 0; i < 4; i++) hash += chars[Math.floor(Math.random() * 16)]
  hash += "..."
  for (let i = 0; i < 4; i++) hash += chars[Math.floor(Math.random() * 16)]
  return hash
}

function getCurrentTimestamp(): string {
  const now = new Date()
  return now.toISOString().replace("T", " ").substring(0, 19)
}

// Initial data
const initialCirculars: Circular[] = [
  { id: "1", title: "Enhanced KYC for High-Value Trading Accounts", ref: "SEBI/HO/MIRSD/POD-1/P/CIR/2026/108", category: "KYC/AML", date: "2026-07-08", impact: "High", obligations: 12, status: "Under Review" },
  { id: "2", title: "Disclosure Norms for Related Party Transactions", ref: "SEBI/HO/CFD/PoD-2/CIR/P/2026/104", category: "Disclosure", date: "2026-07-02", impact: "Medium", obligations: 7, status: "Under Review" },
  { id: "3", title: "Cyber Security Framework for Market Infrastructure Institutions", ref: "SEBI/HO/MRD/DP/CIR/P/2026/099", category: "Cyber", date: "2026-06-24", impact: "High", obligations: 18, status: "Resolved" },
  { id: "4", title: "Mutual Fund Expense Ratio Reporting", ref: "SEBI/HO/IMD/DF3/CIR/P/2026/091", category: "Reporting", date: "2026-06-14", impact: "Medium", obligations: 5, status: "Resolved" },
  { id: "5", title: "REIT & InvIT Quarterly Compliance Filings", ref: "SEBI/HO/DDHS/CIR/P/2026/086", category: "Filing", date: "2026-06-03", impact: "Low", obligations: 3, status: "Resolved" },
  { id: "6", title: "Client Funds Segregation & Monitoring", ref: "SEBI/HO/MIRSD/DoR/CIR/P/2026/077", category: "Client Assets", date: "2026-05-19", impact: "High", obligations: 9, status: "Resolved" },
  { id: "7", title: "AIF Investor Reporting Standards", ref: "SEBI/HO/AFD/PoD/CIR/P/2026/072", category: "Reporting", date: "2026-05-11", impact: "Medium", obligations: 6, status: "Under Review" },
]

const initialExtractedObligations: ExtractedObligation[] = [
  { id: "PC-01", regulation: "Reg 4(2)(a)", mapping: "OBL-2041", text: "Every intermediary shall verify PAN-Aadhaar linkage for all accounts with AUM exceeding ₹50 lakh, within 30 days of circular effective date.", confidence: 96, isMapped: true, circularRef: "SEBI/HO/MIRSD/POD-1/P/CIR/2026/108", status: "pending" },
  { id: "PC-02", regulation: "Reg 4(2)(b)", mapping: "OBL-2040", text: "A quarterly video-KYC refresh shall be conducted for all High Net-worth Individual (HNI) client accounts.", confidence: 91, isMapped: true, circularRef: "SEBI/HO/MIRSD/POD-1/P/CIR/2026/108", status: "pending" },
  { id: "PC-03", regulation: "Reg 5(1)", mapping: null, text: "Dormant accounts (no activity > 12 months) shall be reported to SEBI within 15 working days of classification.", confidence: 84, isMapped: false, circularRef: "SEBI/HO/MIRSD/POD-1/P/CIR/2026/108", status: "pending" },
  { id: "PC-04", regulation: "Reg 5(2)", mapping: null, text: "The compliance officer shall maintain an auditable trail of all KYC refresh attempts, including failed verifications.", confidence: 79, isMapped: false, circularRef: "SEBI/HO/MIRSD/POD-1/P/CIR/2026/108", status: "pending" },
]

const initialComplianceObligations: ComplianceObligation[] = [
  { id: "OBL-2041", text: "Verify PAN & Aadhaar linkage for all accounts > ₹50 lakh", circularRef: "SEBI/HO/MIRSD/POD-1/P/CIR/2026/108", clause: "Reg 4(2)(a)", owner: "R. Iyer", due: "2026-07-25", evidence: 2, status: "At Risk" },
  { id: "OBL-2040", text: "Quarterly video-KYC refresh for HNI clients", circularRef: "SEBI/HO/MIRSD/POD-1/P/CIR/2026/108", clause: "Reg 7(1)", owner: "P. Sharma", due: "2026-08-15", evidence: 0, status: "Pending" },
  { id: "OBL-2039", text: "Board approval log for RPTs above materiality threshold", circularRef: "SEBI/HO/CFD/PoD-2/CIR/P/2026/104", clause: "Cl. 3.2", owner: "N. Menon", due: "2026-07-18", evidence: 4, status: "At Risk" },
  { id: "OBL-2038", text: "Annual VAPT report submission to SEBI", circularRef: "SEBI/HO/MRD/DP/CIR/P/2026/099", clause: "Reg 12", owner: "A. Kulkarni", due: "2026-09-30", evidence: 6, status: "Compliant" },
  { id: "OBL-2037", text: "Publish TER breakdown on scheme information document", circularRef: "SEBI/HO/IMD/DF3/CIR/P/2026/091", clause: "Reg 5(3)", owner: "S. Rao", due: "2026-07-10", evidence: 3, status: "Compliant" },
  { id: "OBL-2036", text: "Daily reconciliation of client bank accounts", circularRef: "SEBI/HO/MIRSD/DoR/CIR/P/2026/077", clause: "Cl. 8", owner: "R. Iyer", due: "2026-07-13", evidence: 1, status: "Overdue" },
  { id: "OBL-2035", text: "Investor grievance redressal within 21 days", circularRef: "SEBI/HO/AFD/PoD/CIR/P/2026/072", clause: "Reg 22", owner: "N. Menon", due: "2026-08-02", evidence: 5, status: "Compliant" },
]

const initialTasks: Task[] = [
  { id: "T-8818", priority: "MEDIUM", title: "Update KYC SOP with new PAN checks", obligation: "OBL-2041", due: "2026-07-22", owner: "P. Sharma", status: "todo" },
  { id: "T-8816", priority: "LOW", title: "Schedule Compliance Committee walkthrough", obligation: "OBL-2035", due: "2026-07-28", owner: "N. Menon", status: "todo" },
  { id: "T-8821", priority: "HIGH", title: "Draft policy update: Client Funds Segregation", obligation: "OBL-2036", due: "2026-07-14", owner: "R. Iyer", status: "in-progress" },
  { id: "T-8820", priority: "MEDIUM", title: "Collect VAPT evidence Q2 from InfoSec", obligation: "OBL-2038", due: "2026-07-20", owner: "A. Kulkarni", status: "in-progress" },
  { id: "T-8819", priority: "HIGH", title: "Legal review of RPT board resolution", obligation: "OBL-2039", due: "2026-07-17", owner: "N. Menon", status: "in-review" },
  { id: "T-8817", priority: "LOW", title: "Publish revised TER on portal", obligation: "OBL-2037", due: "2026-07-10", owner: "S. Rao", status: "done" },
]

const initialEvidence: Evidence[] = [
  { id: "EV-5512", filename: "Q2_VAPT_Report_2026.pdf", size: "4.2 MB", obligation: "OBL-2038", uploadedBy: "A. Kulkarni", date: "2026-07-05", hash: "0x8a3f...c21e" },
  { id: "EV-5511", filename: "Board_Minutes_RPT_June.docx", size: "812 KB", obligation: "OBL-2039", uploadedBy: "N. Menon", date: "2026-07-04", hash: "0x1d9b...44a7" },
  { id: "EV-5510", filename: "Client_Bank_Recon_2026-07-03.xlsx", size: "2.1 MB", obligation: "OBL-2036", uploadedBy: "R. Iyer", date: "2026-07-03", hash: "0xef22...9010" },
  { id: "EV-5509", filename: "TER_Disclosure_Scheme_A.pdf", size: "1.6 MB", obligation: "OBL-2037", uploadedBy: "S. Rao", date: "2026-07-01", hash: "0x772c...3b58" },
  { id: "EV-5508", filename: "HNI_VideoKYC_Log_June.csv", size: "340 KB", obligation: "OBL-2040", uploadedBy: "P. Sharma", date: "2026-06-30", hash: "0x0aac...d7f1" },
  { id: "EV-5507", filename: "Grievance_Register_Q2.xlsx", size: "980 KB", obligation: "OBL-2035", uploadedBy: "N. Menon", date: "2026-06-29", hash: "0xbb14...22e3" },
]

const initialAuditEntries: AuditEntry[] = [
  { timestamp: "2026-07-09 14:22:11", actor: "R. Iyer", isSystem: false, action: "Uploaded evidence", entity: "EV-5510", ip: "10.24.11.4" },
  { timestamp: "2026-07-09 13:04:52", actor: "System", isSystem: true, action: "Auto-ingested circular", entity: "SEBI/HO/MIRSD/POD-1/P/CIR/2026/108", ip: null },
  { timestamp: "2026-07-09 11:41:08", actor: "N. Menon", isSystem: false, action: "Approved obligation mapping", entity: "OBL-2039", ip: "10.24.7.19" },
  { timestamp: "2026-07-09 10:12:33", actor: "A. Kulkarni", isSystem: false, action: "Closed task", entity: "T-8817", ip: "10.24.19.2" },
  { timestamp: "2026-07-08 18:55:07", actor: "Copilot", isSystem: true, action: "Suggested clause mapping", entity: "OBL-2041", ip: null },
  { timestamp: "2026-07-08 17:30:19", actor: "P. Sharma", isSystem: false, action: "Edited SOP draft", entity: "SOP-KYC-v4.2", ip: "10.24.11.9" },
  { timestamp: "2026-07-08 16:02:44", actor: "R. Iyer", isSystem: false, action: "Flagged breach", entity: "OBL-2036", ip: "10.24.11.4" },
  { timestamp: "2026-07-08 09:18:00", actor: "System", isSystem: true, action: "Nightly integrity check", entity: "Ledger #2026-189", ip: null },
]

// Store interface
interface AppState {
  circulars: Circular[]
  extractedObligations: ExtractedObligation[]
  complianceObligations: ComplianceObligation[]
  tasks: Task[]
  evidence: Evidence[]
  auditEntries: AuditEntry[]
  evidenceCounter: number

  // Actions
  approveObligation: (obligationId: string, actor: string) => void
  rejectObligation: (obligationId: string) => void
  uploadEvidence: (filename: string, size: string, obligationId: string, uploadedBy: string) => void
  moveTask: (taskId: string, newStatus: TaskStatus) => void
  addAuditEntry: (actor: string, action: string, entity: string, ip: string | null) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  circulars: initialCirculars,
  extractedObligations: initialExtractedObligations,
  complianceObligations: initialComplianceObligations,
  tasks: initialTasks,
  evidence: initialEvidence,
  auditEntries: initialAuditEntries,
  evidenceCounter: 5512,

  approveObligation: (obligationId: string, actor: string) => {
    const state = get()
    const obligation = state.extractedObligations.find(o => o.id === obligationId)
    if (!obligation || obligation.status !== "pending") return

    const newObligationId = `OBL-${2050 + Math.floor(Math.random() * 100)}`
    const timestamp = getCurrentTimestamp()

    set({
      extractedObligations: state.extractedObligations.map(o =>
        o.id === obligationId ? { ...o, status: "approved" as const } : o
      ),
      complianceObligations: [
        {
          id: newObligationId,
          text: obligation.text,
          circularRef: obligation.circularRef,
          clause: obligation.regulation,
          owner: actor,
          due: "2026-08-15",
          evidence: 0,
          status: "Pending" as ObligationStatus,
        },
        ...state.complianceObligations,
      ],
      tasks: [
        {
          id: `T-${8800 + Math.floor(Math.random() * 100)}`,
          priority: obligation.confidence >= 90 ? "HIGH" : "MEDIUM",
          title: `Implement: ${obligation.text.substring(0, 50)}...`,
          obligation: newObligationId,
          due: "2026-08-15",
          owner: actor,
          status: "todo" as TaskStatus,
        },
        ...state.tasks,
      ],
      auditEntries: [
        {
          timestamp,
          actor,
          isSystem: false,
          action: "Rule Approved",
          entity: obligationId,
          ip: "10.24.11.4",
        },
        ...state.auditEntries,
      ],
    })
  },

  rejectObligation: (obligationId: string) => {
    const state = get()
    set({
      extractedObligations: state.extractedObligations.map(o =>
        o.id === obligationId ? { ...o, status: "rejected" as const } : o
      ),
    })
  },

  uploadEvidence: (filename: string, size: string, obligationId: string, uploadedBy: string) => {
    const state = get()
    const newCounter = state.evidenceCounter + 1
    const hash = generateHash()
    const timestamp = getCurrentTimestamp()
    const newEvidenceId = `EV-${newCounter}`

    set({
      evidenceCounter: newCounter,
      evidence: [
        {
          id: newEvidenceId,
          filename,
          size,
          obligation: obligationId,
          uploadedBy,
          date: timestamp.split(" ")[0],
          hash,
        },
        ...state.evidence,
      ],
      complianceObligations: state.complianceObligations.map(o =>
        o.id === obligationId ? { ...o, evidence: o.evidence + 1, status: "Compliant" as ObligationStatus } : o
      ),
      tasks: state.tasks.map(t =>
        t.obligation === obligationId ? { ...t, status: "done" as TaskStatus } : t
      ),
      auditEntries: [
        {
          timestamp,
          actor: uploadedBy,
          isSystem: false,
          action: "Evidence Uploaded",
          entity: newEvidenceId,
          ip: "10.24.11.4",
        },
        ...state.auditEntries,
      ],
    })
  },

  moveTask: (taskId: string, newStatus: TaskStatus) => {
    const state = get()
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) return

    const updatedTasks = state.tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    )

    let updatedObligations = state.complianceObligations
    if (newStatus === "done" && task.obligation) {
      updatedObligations = state.complianceObligations.map(o =>
        o.id === task.obligation ? { ...o, status: "Compliant" as ObligationStatus } : o
      )
    }

    set({
      tasks: updatedTasks,
      complianceObligations: updatedObligations,
    })
  },

  addAuditEntry: (actor: string, action: string, entity: string, ip: string | null) => {
    const state = get()
    const timestamp = getCurrentTimestamp()
    set({
      auditEntries: [
        {
          timestamp,
          actor,
          isSystem: actor === "System" || actor === "Copilot",
          action,
          entity,
          ip,
        },
        ...state.auditEntries,
      ],
    })
  },
}))