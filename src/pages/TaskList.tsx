import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuthStore, useAppStore } from '../store';
import { Search, Plus, Filter, X, ChevronRight, Clock, CheckCircle2, AlertCircle, PlayCircle, PauseCircle, XCircle, Calendar, User, ListTodo } from 'lucide-react';
import { cn } from '../components/Layout';
import TaskDetailModal from '../components/TaskDetailModal';
import TaskFormModal from '../components/TaskFormModal';

export default function TaskList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { user } = useAuthStore();
  const { triggerRefresh } = useAppStore();

  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [workstreamFilter, setWorkstreamFilter] = useState(searchParams.get('workstream') || '');
  const [weekFilter, setWeekFilter] = useState(searchParams.get('weekNo') || '');
  const [overdueFilter, setOverdueFilter] = useState(searchParams.get('overdue') === 'true');

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const taskId = searchParams.get('id');
    if (taskId && tasks.length > 0) {
      const task = tasks.find(t => t.id === Number(taskId));
      if (task) {
        setSelectedTask(task);
        setIsDetailOpen(true);
      }
    }
  }, [searchParams, tasks]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async () => {
    await fetchTasks();
    triggerRefresh();
    setIsFormOpen(false);
  };

  const handleUpdateTask = async () => {
    await fetchTasks();
    triggerRefresh();
  };

  const clearFilters = () => {
    setStatusFilter('');
    setWorkstreamFilter('');
    setWeekFilter('');
    setOverdueFilter(false);
    setSearchQuery('');
    setSearchParams({});
  };

  const today = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter(task => {
    if (searchQuery && !task.taskTitle?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter && task.status !== statusFilter) return false;
    if (workstreamFilter && task.workstream !== workstreamFilter) return false;
    if (weekFilter && String(task.weekNo) !== weekFilter) return false;
    if (overdueFilter && (!task.endDate || task.endDate >= today || task.status === 'Hoàn thành')) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hoàn thành': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Đang thực hiện': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Chưa bắt đầu': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Tạm dừng': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Hủy': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Hoàn thành': return <CheckCircle2 size={14} className="mr-1" />;
      case 'Đang thực hiện': return <PlayCircle size={14} className="mr-1" />;
      case 'Chưa bắt đầu': return <Clock size={14} className="mr-1" />;
      case 'Tạm dừng': return <PauseCircle size={14} className="mr-1" />;
      case 'Hủy': return <XCircle size={14} className="mr-1" />;
      default: return null;
    }
  };

  const uniqueWorkstreams = Array.from(new Set(tasks.map(t => t.workstream).filter(Boolean)));
  const uniqueWeeks = Array.from(new Set(tasks.map(t => t.weekNo).filter(Boolean))).sort((a, b) => Number(a) - Number(b));

  const hasActiveFilters = statusFilter || workstreamFilter || weekFilter || overdueFilter || searchQuery;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">Danh sách nhiệm vụ</h1>
        {user?.role === 'manager' && (
          <button
            onClick={() => { setSelectedTask(null); setIsFormOpen(true); }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Thêm nhiệm vụ
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 shrink-0">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm nhiệm vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Chưa bắt đầu">Chưa bắt đầu</option>
              <option value="Đang thực hiện">Đang thực hiện</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Tạm dừng">Tạm dừng</option>
              <option value="Hủy">Hủy</option>
            </select>

            <select
              value={workstreamFilter}
              onChange={(e) => setWorkstreamFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="">Tất cả Workstream</option>
              {uniqueWorkstreams.map(ws => (
                <option key={ws} value={ws}>{ws}</option>
              ))}
            </select>

            <select
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="">Tất cả tuần</option>
              {uniqueWeeks.map(w => (
                <option key={w} value={w}>Tuần {w}</option>
              ))}
            </select>

            <button
              onClick={() => setOverdueFilter(!overdueFilter)}
              className={cn(
                "px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center",
                overdueFilter ? "bg-rose-100 border-rose-200 text-rose-700" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              )}
            >
              <AlertCircle size={16} className="mr-1.5" />
              Quá hạn
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center"
              >
                <X size={16} className="mr-1.5" />
                Xóa lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ListTodo className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">Không tìm thấy nhiệm vụ</h3>
            <p className="text-slate-500 max-w-sm">
              Không có nhiệm vụ nào khớp với điều kiện tìm kiếm hiện tại. Hãy thử thay đổi bộ lọc.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-emerald-600 font-medium hover:text-emerald-700"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nhiệm vụ</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiến độ</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phụ trách</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hạn chót</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Chi tiết</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredTasks.map((task) => {
                  const isOverdue = task.endDate && task.endDate < today && task.status !== 'Hoàn thành';
                  return (
                    <tr 
                      key={task.id} 
                      onClick={() => { setSelectedTask(task); setIsDetailOpen(true); }}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                            {task.taskTitle}
                          </span>
                          <div className="flex items-center mt-1 space-x-2 text-xs text-slate-500">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md">{task.workstream || 'N/A'}</span>
                            {isOverdue && (
                              <span className="flex items-center text-rose-600 font-medium">
                                <AlertCircle size={12} className="mr-1" /> Quá hạn
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border", getStatusColor(task.status))}>
                          {getStatusIcon(task.status)}
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-slate-700 w-10">{task.progress || 0}%</span>
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden ml-2">
                            <div 
                              className={cn("h-full rounded-full", task.progress === 100 ? "bg-emerald-500" : "bg-emerald-500")}
                              style={{ width: `${task.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-700">
                          <User size={14} className="mr-1.5 text-slate-400" />
                          {task.owner || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={cn("flex items-center text-sm", isOverdue ? "text-rose-600 font-medium" : "text-slate-700")}>
                          <Calendar size={14} className={cn("mr-1.5", isOverdue ? "text-rose-500" : "text-slate-400")} />
                          {task.endDate ? new Date(task.endDate).toLocaleDateString('vi-VN') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ChevronRight className="text-slate-400 group-hover:text-emerald-600 transition-colors ml-auto" size={20} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <TaskFormModal
          task={selectedTask}
          onClose={() => { setIsFormOpen(false); setSelectedTask(null); }}
          onSave={handleSaveTask}
        />
      )}

      {isDetailOpen && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => { setIsDetailOpen(false); setSelectedTask(null); setSearchParams({}); }}
          onUpdate={handleUpdateTask}
          onDelete={async () => {
            await fetchTasks();
            triggerRefresh();
            setIsDetailOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}
