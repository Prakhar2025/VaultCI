"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GlassCard from "@/components/ui/GlassCard";

interface AIvsHumanBarProps {
  total: number;
  ai: number;
  blocked: number; // simplifying, assume some distribution
}

export default function AIvsHumanBar({ total, ai, blocked }: AIvsHumanBarProps) {
  const human = total - ai;
  
  // Mocking the block distribution for visual demo
  const aiBlocked = Math.min(ai, Math.ceil(blocked * 0.8));
  const humanBlocked = Math.max(0, blocked - aiBlocked);

  const data = [
    {
      name: 'Human Engineers',
      Approved: human - humanBlocked,
      Blocked: humanBlocked,
    },
    {
      name: 'AI Agents',
      Approved: ai - aiBlocked,
      Blocked: aiBlocked,
    },
  ];

  return (
    <GlassCard className="p-6 h-[400px]">
      <h3 className="text-lg font-bold mb-6">AI vs Human Approval Rates</h3>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barSize={60}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="Approved" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} animationDuration={1500} />
            <Bar dataKey="Blocked" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
