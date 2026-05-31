"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from "@/components/ui/GlassCard";

interface TrendChartProps {
  data: Array<{ created_at: string; trust_score: number }>;
}

export default function TrendChart({ data }: TrendChartProps) {
  // Format data for chart
  const chartData = data.map(d => ({
    time: new Date(d.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    score: Number((d.trust_score * 100).toFixed(0))
  }));

  return (
    <GlassCard className="p-6 h-[400px]">
      <h3 className="text-lg font-bold mb-6">Trust Score Trend (Last 30 PRs)</h3>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.5)" 
              fontSize={12}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)" 
              fontSize={12} 
              domain={[0, 100]}
              tickFormatter={(val) => `${val}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#8b5cf6' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#10b981', strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
