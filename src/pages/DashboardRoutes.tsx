import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "../hooks/use-auth";
import MemberDashboard from "./MemberDashboard";
import LeaderDashboard from "./LeaderDashboard";
import Gallery from "./Gallery";

import { ActivePhaseFloat } from "../components/ActivePhaseFloat";

export default function DashboardRoutes() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const isLeader = user.role === "leader" || user.role === "co-leader" || user.role === "co-lead";

  return (
    <div className="min-h-screen font-sans relative overflow-hidden">
      {/* High-Fidelity CSS 3D Rings Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-black overflow-hidden">
        {/* Ring 1 - Top Right */}
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full border-[2px] border-white/20 shadow-[inset_0_0_80px_rgba(255,255,255,0.05),0_0_80px_rgba(255,255,255,0.1)] blur-[1px]"></div>
        <div className="absolute top-[-18%] right-[-8%] w-[56vw] h-[56vw] rounded-full border-[1px] border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)]"></div>
        
        {/* Ring 2 - Bottom Left (angled) */}
        <div className="absolute bottom-[-30%] left-[-20%] w-[80vw] h-[80vw] rounded-full border-[4px] border-white/10 shadow-[inset_0_0_120px_rgba(255,255,255,0.08),0_0_120px_rgba(255,255,255,0.15)] blur-[3px] scale-y-75 rotate-45"></div>
        <div className="absolute bottom-[-28%] left-[-18%] w-[76vw] h-[76vw] rounded-full border-[1px] border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-y-75 rotate-45"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-white/5 blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[30%] w-[40vw] h-[40vw] rounded-full bg-slate-400/5 blur-[120px]"></div>
      </div>
      <ActivePhaseFloat />
      <Routes>
        <Route path="/" element={isLeader ? <LeaderDashboard /> : <MemberDashboard />} />
        <Route path="/profile" element={<MemberDashboard />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/gallery/:userId" element={<Gallery />} />
      </Routes>
    </div>
  );
}
