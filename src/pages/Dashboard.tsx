import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAppStore } from '../store';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { refreshTrigger } = useAppStore();

  useEffect(() => {
    fetchDashboard();
  }, [refreshTrigger]);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;
  if (!data) return <div>Lỗi tải dữ liệu</div>;

  const statCards = [
    { title: 'Tổng số nhiệm vụ', value: data.total, icon: ListTodo, color: 'text-emerald-600', bg: 'bg-emerald-100', filter: {} },
    { title: 'Đang thực hiện', value: data.inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', filter: { status: 'Đang thực hiện' } },
    { title: 'Hoàn thành', value: data.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', filter: { status: 'Hoàn thành' } },
    { title: 'Quá hạn', value: data.overdue, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100', filter: { overdue: true } },
  ];

  const handleDrillDown = (filter: any) => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    navigate(`/tasks?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan dự án</h1>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
          <TrendingUp className="text-emerald-500" size={20} />
          <span className="text-sm font-medium text-slate-600">Tiến độ trung bình:</span>
          <span className="text-lg font-bold text-emerald-700">{data.avgProgress}%</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              onClick={() => handleDrillDown(stat.filter)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workstream Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Nhiệm vụ theo Workstream</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.workstreams} onClick={(e) => e && e.activeLabel && handleDrillDown({ workstream: e.activeLabel })}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} className="cursor-pointer hover:opacity-80" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Tỷ lệ trạng thái</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(e) => handleDrillDown({ status: e.name })}
                  className="cursor-pointer hover:opacity-80"
                >
                  {data.statusCounts.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Xu hướng theo tuần</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeklyTrend} onClick={(e) => e && e.activeLabel && handleDrillDown({ weekNo: String(e.activeLabel).replace('Tuần ', '') })}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} className="cursor-pointer" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Tasks */}
      {data.riskTasks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-rose-50/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-rose-500" size={20} />
              <h2 className="text-lg font-semibold text-rose-900">Nhiệm vụ rủi ro / Quá hạn</h2>
            </div>
            <button 
              onClick={() => handleDrillDown({ overdue: true })}
              className="text-sm font-medium text-rose-600 hover:text-rose-700"
            >
              Xem tất cả
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {data.riskTasks.map((task: any) => (
              <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/tasks?id=${task.id}`)}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-slate-900">{task.taskTitle}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                    Quá hạn
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>Hạn chót: <strong className="text-rose-600">{task.endDate}</strong></span>
                  <span>Người phụ trách: <strong>{task.owner}</strong></span>
                  <span>Tiến độ: <strong>{task.progress}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
