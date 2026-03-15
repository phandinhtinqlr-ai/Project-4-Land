import React, { useState } from 'react';
import { X, Edit2, Trash2, Clock, CheckCircle2, AlertCircle, PlayCircle, PauseCircle, XCircle, Calendar, User, AlignLeft, Tag, Activity, Save } from 'lucide-react';
import { useAuthStore } from '../store';
import { api } from '../api';
import { cn } from './Layout';

interface TaskDetailModalProps {
  task: any;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function TaskDetailModal({ task, onClose, onUpdate, onDelete }: TaskDetailModalProps) {
  const { user } = useAuthStore();
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [progressData, setProgressData] = useState({
    progress: task.progress,
    status: task.status,
    result: task.result || '',
    notes: task.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isManager = user?.role === 'manager';
  const isOwner = user?.name === task.owner || user?.username === task.owner;
  const canEdit = isManager || isOwner;

  const handleUpdateProgress = async () => {
    setLoading(true);
    try {
      await api.updateTask(task.id, progressData);
      onUpdate();
      setIsEditingProgress(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deleteTask(task.id);
      onDelete();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

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
      case 'Hoàn thành': return <CheckCircle2 size={16} className="mr-1.5" />;
      case 'Đang thực hiện': return <PlayCircle size={16} className="mr-1.5" />;
      case 'Chưa bắt đầu': return <Clock size={16} className="mr-1.5" />;
      case 'Tạm dừng': return <PauseCircle size={16} className="mr-1.5" />;
      case 'Hủy': return <XCircle size={16} className="mr-1.5" />;
      default: return null;
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = task.endDate && task.endDate < today && task.status !== 'Hoàn thành';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex-1 pr-4">
            <div className="flex items-center space-x-3 mb-2">
              <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border", getStatusColor(task.status))}>
                {getStatusIcon(task.status)}
                {task.status}
              </span>
              {isOverdue && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                  <AlertCircle size={14} className="mr-1" />
                  Quá hạn
                </span>
              )}
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                Ưu tiên: {task.priority || 'Trung bình'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{task.taskTitle}</h2>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            {isManager && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Xóa nhiệm vụ"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showDeleteConfirm && (
            <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between">
              <div className="flex items-start">
                <AlertCircle className="text-rose-600 mt-0.5 mr-3 shrink-0" size={20} />
                <div>
                  <h4 className="text-sm font-semibold text-rose-900">Xác nhận xóa nhiệm vụ</h4>
                  <p className="text-sm text-rose-700 mt-1">Bạn có chắc chắn muốn xóa nhiệm vụ này? Hành động này không thể hoàn tác.</p>
                </div>
              </div>
              <div className="flex space-x-3 shrink-0 ml-4">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-rose-100 rounded-lg transition-colors">
                  Hủy
                </button>
                <button onClick={handleDelete} disabled={loading} className="px-3 py-1.5 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50">
                  {loading ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <section>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center">
                  <AlignLeft size={16} className="mr-2 text-slate-400" />
                  Mô tả chi tiết
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap min-h-[100px]">
                  {task.taskDescription || <span className="text-slate-400 italic">Không có mô tả</span>}
                </div>
              </section>

              {/* Progress Update Section */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center">
                    <Activity size={16} className="mr-2 text-slate-400" />
                    Cập nhật kết quả thực hiện
                  </h3>
                  {canEdit && !isEditingProgress && (
                    <button 
                      onClick={() => setIsEditingProgress(true)}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center"
                    >
                      <Edit2 size={14} className="mr-1" /> Cập nhật kết quả
                    </button>
                  )}
                </div>

                {isEditingProgress ? (
                  <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-medium text-slate-700">Tiến độ (%)</label>
                          <span className="text-sm font-bold text-emerald-600">{progressData.progress}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progressData.progress}
                          onChange={(e) => setProgressData({...progressData, progress: Number(e.target.value)})}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                        <select
                          value={progressData.status}
                          onChange={(e) => setProgressData({...progressData, status: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                          <option value="Đang thực hiện">Đang thực hiện</option>
                          <option value="Hoàn thành">Hoàn thành</option>
                          <option value="Tạm dừng">Tạm dừng</option>
                          <option value="Hủy">Hủy</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Kết quả thực hiện</label>
                      <textarea
                        value={progressData.result}
                        onChange={(e) => setProgressData({...progressData, result: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                        placeholder="Nhập kết quả đã đạt được..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú bổ sung</label>
                      <textarea
                        value={progressData.notes}
                        onChange={(e) => setProgressData({...progressData, notes: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                        placeholder="Ghi chú thêm nếu có..."
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                      <button 
                        onClick={() => {
                          setIsEditingProgress(false);
                          setProgressData({ progress: task.progress, status: task.status, result: task.result, notes: task.notes });
                        }}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Hủy
                      </button>
                      <button 
                        onClick={handleUpdateProgress}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Đang lưu...' : <><Save size={16} className="mr-2" /> Lưu kết quả</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Tiến độ hiện tại</span>
                        <span className="text-sm font-bold text-emerald-600">{task.progress || 0}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-500", task.progress === 100 ? "bg-emerald-500" : "bg-emerald-500")}
                          style={{ width: `${task.progress || 0}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Kết quả thực hiện</span>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap">{task.result || <span className="text-slate-400 italic">Chưa cập nhật</span>}</p>
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Ghi chú</span>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap">{task.notes || <span className="text-slate-400 italic">Không có</span>}</p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Meta info */}
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Thông tin chung</h3>
                
                <div className="flex items-start space-x-3">
                  <User className="text-slate-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs font-medium text-slate-500">Người phụ trách</p>
                    <p className="text-sm font-medium text-slate-900">{task.owner || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="text-slate-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs font-medium text-slate-500">Thời gian thực hiện</p>
                    <p className="text-sm font-medium text-slate-900">
                      {task.startDate ? new Date(task.startDate).toLocaleDateString('vi-VN') : '-'} 
                      <span className="text-slate-400 mx-1">đến</span> 
                      <span className={cn(isOverdue ? "text-rose-600" : "")}>
                        {task.endDate ? new Date(task.endDate).toLocaleDateString('vi-VN') : '-'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Tag className="text-slate-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs font-medium text-slate-500">Phân loại</p>
                    <div className="mt-1 space-y-1">
                      {task.workstream && <p className="text-sm text-slate-700"><span className="text-slate-500">Workstream:</span> {task.workstream}</p>}
                      {task.department && <p className="text-sm text-slate-700"><span className="text-slate-500">Phòng ban:</span> {task.department}</p>}
                      {task.weekNo && <p className="text-sm text-slate-700"><span className="text-slate-500">Tuần:</span> {task.weekNo}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Lịch sử cập nhật</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Cập nhật lần cuối</p>
                    <p className="text-sm text-slate-900 mt-0.5">
                      {task.updatedAt ? new Date(task.updatedAt).toLocaleString('vi-VN') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Người cập nhật</p>
                    <p className="text-sm text-slate-900 font-medium mt-0.5">{task.updatedBy || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Ngày tạo</p>
                    <p className="text-sm text-slate-900 mt-0.5">
                      {task.createdAt ? new Date(task.createdAt).toLocaleString('vi-VN') : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
