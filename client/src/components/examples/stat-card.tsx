import { StatCard } from "../stat-card";
import { ClipboardList } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="p-6 bg-background">
      <StatCard
        title="Total Tasks"
        value={42}
        icon={ClipboardList}
        description="from last month"
        trend="+12%"
      />
    </div>
  );
}
