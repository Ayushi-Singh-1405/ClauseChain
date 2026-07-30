import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Circulars</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">--</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Pending Rules</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">--</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Open Tasks</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">--</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Compliance Score</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">--</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
