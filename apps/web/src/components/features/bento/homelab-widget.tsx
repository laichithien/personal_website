"use client";

import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ExpandableWidget } from "./expandable-widget";
import { Server, HardDrive, Cpu, Network, Shield, Activity } from "lucide-react";

export function HomelabWidget() {
  const stats = [
    { label: "Nodes", value: "3", icon: Server },
    { label: "Storage", value: "8TB", icon: HardDrive },
    { label: "CPU Cores", value: "24", icon: Cpu },
  ];

  const detailedStats = [
    { label: "Nodes", value: "3", icon: Server, detail: "Proxmox VE Cluster" },
    { label: "Storage", value: "8TB", icon: HardDrive, detail: "ZFS RAID-Z2" },
    { label: "CPU Cores", value: "24", icon: Cpu, detail: "Intel Xeon E5-2680" },
    { label: "Network", value: "10Gbps", icon: Network, detail: "Internal backbone" },
    { label: "VMs", value: "12", icon: Shield, detail: "Running containers" },
    { label: "Uptime", value: "99.9%", icon: Activity, detail: "Last 30 days" },
  ];

  const services = [
    "Kubernetes (K3s)",
    "Docker Swarm",
    "Nginx Reverse Proxy",
    "Pi-hole DNS",
    "Grafana Monitoring",
    "Home Assistant",
    "Plex Media Server",
    "NextCloud",
  ];

  const expandedContent = (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-green-400">
        <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        <span className="font-medium">All Systems Operational</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {detailedStats.map(({ label, value, icon: Icon, detail }) => (
          <div key={label} className="bg-white/5 rounded-xl p-4 text-center">
            <Icon className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-white/60">{label}</p>
            <p className="text-xs text-white/40 mt-1">{detail}</p>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-3">Running Services</h4>
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <span
              key={service}
              className="px-3 py-1.5 rounded-full text-sm bg-white/10 text-white/80"
            >
              {service}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <p className="text-sm text-white/50">
          Self-hosted infrastructure for development and media
        </p>
      </div>
    </div>
  );

  return (
    <ExpandableWidget title="Homelab Status" expandedContent={expandedContent}>
      <LiquidGlass blur="lg" glow hoverable className="h-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Homelab Status</h3>
          <span className="flex items-center gap-2 text-sm text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Online
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="w-6 h-6 mx-auto mb-2 text-white/60" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-white/40">{label}</p>
            </div>
          ))}
        </div>
      </LiquidGlass>
    </ExpandableWidget>
  );
}
