"use client";

import { Bot, FileText, MessageSquare, Wrench } from "lucide-react";
import { useDashboardStats, useRecentActivity } from "@/hooks/use-admin-api";

function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
}: {
  title: string;
  value: number;
  subValue?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">{title}</p>
          <p className="text-3xl font-semibold mt-1">{value}</p>
          {subValue && (
            <p className="text-sm text-cyan-400 mt-1">{subValue}</p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-pulse"
              >
                <div className="h-4 bg-zinc-800 rounded w-1/2 mb-2" />
                <div className="h-8 bg-zinc-800 rounded w-1/3" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Agents"
              value={stats?.total_agents || 0}
              subValue={`${stats?.active_agents || 0} active`}
              icon={Bot}
            />
            <StatCard
              title="Tools"
              value={stats?.total_tools || 0}
              icon={Wrench}
            />
            <StatCard
              title="Documents"
              value={stats?.total_documents || 0}
              icon={FileText}
            />
            <StatCard
              title="Sessions"
              value={stats?.total_sessions || 0}
              subValue={`${stats?.sessions_today || 0} today`}
              icon={MessageSquare}
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-medium mb-4">Recent Activity</h2>

        {activityLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-2 h-2 bg-zinc-800 rounded-full" />
                <div className="h-4 bg-zinc-800 rounded flex-1" />
              </div>
            ))}
          </div>
        ) : activity && activity.length > 0 ? (
          <div className="space-y-3">
            {activity.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 text-sm"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 ${
                    item.type === "session" ? "bg-cyan-400" : "bg-zinc-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-zinc-300">{item.description}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">No recent activity</p>
        )}
      </div>
    </div>
  );
}
