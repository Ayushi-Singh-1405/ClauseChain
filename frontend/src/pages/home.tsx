import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Welcome to ClauseChain</h1>
        <p className="mt-1 text-text-secondary">Agentic compliance platform for SEBI-regulated intermediaries</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary">This is the home page. Navigation is available in the sidebar.</p>
        </CardContent>
      </Card>
    </div>
  )
}