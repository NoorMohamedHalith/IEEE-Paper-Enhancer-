import React from 'react';
import { PaperAnalysis } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, ShieldCheck, AlertCircle, FileText, CheckCircle } from 'lucide-react';

interface AnalysisDashboardProps {
  analysis: PaperAnalysis;
}

const COLORS = ['#064E3B', '#0D9488', '#0284C7', '#6366F1', '#D97706', '#E11D48'];
const CONFIDENCE_COLORS: Record<string, string> = {
  High: '#064E3B',
  Medium: '#D97706',
  Low: '#E11D48',
};

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis }) => {
  const gaps = analysis.researchGaps || [];
  const limitations = analysis.limitations || [];
  const evidences = analysis.evidences || [];
  const results = analysis.results || [];

  // 1. Distribution of Research Gaps by Gap Type
  const gapTypeMap: Record<string, number> = {};
  gaps.forEach((g) => {
    const type = g.gapType || 'Technical';
    gapTypeMap[type] = (gapTypeMap[type] || 0) + 1;
  });

  const gapTypeData = Object.keys(gapTypeMap).map((type) => ({
    name: type,
    count: gapTypeMap[type],
  }));

  // 2. Confidence Scores Distribution
  const confidenceMap: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
  [...gaps, ...limitations].forEach((item) => {
    const conf = item.confidence || 'High';
    confidenceMap[conf] = (confidenceMap[conf] || 0) + 1;
  });

  const confidenceData = [
    { name: 'High Confidence', value: confidenceMap.High, color: CONFIDENCE_COLORS.High },
    { name: 'Medium Confidence', value: confidenceMap.Medium, color: CONFIDENCE_COLORS.Medium },
    { name: 'Low Confidence', value: confidenceMap.Low, color: CONFIDENCE_COLORS.Low },
  ].filter((d) => d.value > 0);

  // 3. Grounding Source Breakdown (Explicit vs Inferred Limitations)
  const limitationTypeMap: Record<string, number> = { EXPLICIT: 0, INFERRED: 0 };
  limitations.forEach((lim) => {
    const t = lim.type === 'INFERRED' ? 'INFERRED' : 'EXPLICIT';
    limitationTypeMap[t] = (limitationTypeMap[t] || 0) + 1;
  });

  const limitationTypeData = [
    { type: 'Explicit Stated', count: limitationTypeMap.EXPLICIT, fill: '#064E3B' },
    { type: 'Logically Inferred', count: limitationTypeMap.INFERRED, fill: '#D97706' },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E8EAEF] p-6 shadow-2xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#E8EAEF]">
        <div>
          <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#064E3B]" />
            Paper Analysis Summary & Evidence Distribution
          </h3>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Visualizing research gaps, confidence ratings, and limitation grounding
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-md bg-[#F0F4F2] text-[#064E3B] text-[11px] font-bold border border-[#CBD5E1]">
          {evidences.length} Verified Evidence Quotes
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF] space-y-1">
          <div className="flex items-center justify-between text-[#64748B] text-[11px] font-bold uppercase">
            <span>Research Gaps</span>
            <AlertCircle className="w-3.5 h-3.5 text-[#064E3B]" />
          </div>
          <p className="text-xl font-bold text-[#1E293B]">{gaps.length}</p>
          <span className="text-[10px] text-[#64748B]">Categorized opportunity areas</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF] space-y-1">
          <div className="flex items-center justify-between text-[#64748B] text-[11px] font-bold uppercase">
            <span>Limitations</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-[#1E293B]">{limitations.length}</p>
          <span className="text-[10px] text-[#64748B]">Explicit & Inferred limits</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF] space-y-1">
          <div className="flex items-center justify-between text-[#64748B] text-[11px] font-bold uppercase">
            <span>Source Evidences</span>
            <FileText className="w-3.5 h-3.5 text-[#064E3B]" />
          </div>
          <p className="text-xl font-bold text-[#1E293B]">{evidences.length}</p>
          <span className="text-[10px] text-[#64748B]">Grounded chunk passages</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF] space-y-1">
          <div className="flex items-center justify-between text-[#64748B] text-[11px] font-bold uppercase">
            <span>Reported Results</span>
            <CheckCircle className="w-3.5 h-3.5 text-[#064E3B]" />
          </div>
          <p className="text-xl font-bold text-[#1E293B]">
            {Array.isArray(results) ? results.length : 0}
          </p>
          <span className="text-[10px] text-[#64748B]">Quantitative metrics</span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">

        {/* Chart 1: Research Gaps Distribution by Type */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5 uppercase">
              <BarChart3 className="w-3.5 h-3.5 text-[#064E3B]" />
              Research Gaps Distribution by Type
            </h4>
          </div>

          <div className="h-56 w-full">
            {gapTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gapTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#064E3B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400 italic">
                No gap types recorded.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Confidence Scores Distribution (Donut Chart) */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5 uppercase">
              <PieIcon className="w-3.5 h-3.5 text-[#064E3B]" />
              Confidence Rating Distribution
            </h4>
          </div>

          <div className="h-56 w-full">
            {confidenceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={confidenceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {confidenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-[#1E293B] font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400 italic">
                No confidence score data recorded.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
