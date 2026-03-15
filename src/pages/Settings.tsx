import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Save, Plus, Trash2, Settings as SettingsIcon, Edit2, X, Check } from 'lucide-react';

export default function Settings() {
  const [config, setConfig] = useState<{ workstreams: string[], departments: string[], owners: string[] }>({ workstreams: [], departments: [], owners: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newWorkstream, setNewWorkstream] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [editing, setEditing] = useState<{ type: 'workstreams' | 'departments' | 'owners', index: number, value: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'workstreams' | 'departments' | 'owners', index: number } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.getConfig();
      setConfig(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: typeof config) => {
    setSaving(true);
    try {
      await api.updateConfig(newConfig);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await saveConfig(config);
    alert('Đã lưu cấu hình thành công!');
  };

  const addItem = (type: 'workstreams' | 'departments' | 'owners', value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    if (config[type].includes(value.trim())) {
      alert('Mục này đã tồn tại');
      return;
    }
    const newConfig = {
      ...config,
      [type]: [...config[type], value.trim()]
    };
    setConfig(newConfig);
    saveConfig(newConfig);
    setter('');
  };

  const updateItem = () => {
    if (!editing || !editing.value.trim()) {
      setEditing(null);
      return;
    }
    
    const { type, index, value } = editing;
    const newList = [...config[type]];
    newList[index] = value.trim();
    
    const newConfig = {
      ...config,
      [type]: newList
    };
    setConfig(newConfig);
    saveConfig(newConfig);
    setEditing(null);
  };

  const removeItem = (type: 'workstreams' | 'departments' | 'owners', index: number) => {
    const newList = [...config[type]];
    newList.splice(index, 1);
    const newConfig = {
      ...config,
      [type]: newList
    };
    setConfig(newConfig);
    saveConfig(newConfig);
    setDeleteConfirm(null);
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <SettingsIcon size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Cấu hình trường dữ liệu</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Save size={18} className="mr-2" />
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workstreams */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-800">Danh sách Workstream</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newWorkstream}
                onChange={(e) => setNewWorkstream(e.target.value)}
                placeholder="Thêm workstream mới..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && addItem('workstreams', newWorkstream, setNewWorkstream)}
              />
              <button
                onClick={() => addItem('workstreams', newWorkstream, setNewWorkstream)}
                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {config.workstreams.map((item, idx) => (
                <div key={idx} className="flex flex-col p-3 bg-slate-50 rounded-xl group transition-all">
                  {editing?.type === 'workstreams' && editing.index === idx ? (
                    <div className="flex items-center space-x-2">
                      <input
                        autoFocus
                        type="text"
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        className="flex-1 px-2 py-1 border border-emerald-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        onKeyPress={(e) => e.key === 'Enter' && updateItem()}
                      />
                      <button onClick={updateItem} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditing(null)} className="p-1 text-slate-400 hover:bg-slate-200 rounded">
                        <X size={16} />
                      </button>
                    </div>
                  ) : deleteConfirm?.type === 'workstreams' && deleteConfirm.index === idx ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-rose-600">Xác nhận xóa?</span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => removeItem('workstreams', idx)}
                          className="px-2 py-1 bg-rose-600 text-white text-xs rounded hover:bg-rose-700"
                        >
                          Xóa
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded hover:bg-slate-300"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">{item}</span>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditing({ type: 'workstreams', index: idx, value: item })}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'workstreams', index: idx })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {config.workstreams.length === 0 && (
                <p className="text-center text-slate-400 py-4 text-sm italic">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-800">Danh sách Bộ phận</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Thêm bộ phận mới..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && addItem('departments', newDepartment, setNewDepartment)}
              />
              <button
                onClick={() => addItem('departments', newDepartment, setNewDepartment)}
                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {config.departments.map((item, idx) => (
                <div key={idx} className="flex flex-col p-3 bg-slate-50 rounded-xl group transition-all">
                  {editing?.type === 'departments' && editing.index === idx ? (
                    <div className="flex items-center space-x-2">
                      <input
                        autoFocus
                        type="text"
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        className="flex-1 px-2 py-1 border border-emerald-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        onKeyPress={(e) => e.key === 'Enter' && updateItem()}
                      />
                      <button onClick={updateItem} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditing(null)} className="p-1 text-slate-400 hover:bg-slate-200 rounded">
                        <X size={16} />
                      </button>
                    </div>
                  ) : deleteConfirm?.type === 'departments' && deleteConfirm.index === idx ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-rose-600">Xác nhận xóa?</span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => removeItem('departments', idx)}
                          className="px-2 py-1 bg-rose-600 text-white text-xs rounded hover:bg-rose-700"
                        >
                          Xóa
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded hover:bg-slate-300"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">{item}</span>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditing({ type: 'departments', index: idx, value: item })}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'departments', index: idx })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {config.departments.length === 0 && (
                <p className="text-center text-slate-400 py-4 text-sm italic">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        {/* Owners */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-800">Danh sách Người phụ trách</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="Thêm người phụ trách mới..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && addItem('owners', newOwner, setNewOwner)}
              />
              <button
                onClick={() => addItem('owners', newOwner, setNewOwner)}
                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {config.owners.map((item, idx) => (
                <div key={idx} className="flex flex-col p-3 bg-slate-50 rounded-xl group transition-all">
                  {editing?.type === 'owners' && editing.index === idx ? (
                    <div className="flex items-center space-x-2">
                      <input
                        autoFocus
                        type="text"
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        className="flex-1 px-2 py-1 border border-emerald-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        onKeyPress={(e) => e.key === 'Enter' && updateItem()}
                      />
                      <button onClick={updateItem} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditing(null)} className="p-1 text-slate-400 hover:bg-slate-200 rounded">
                        <X size={16} />
                      </button>
                    </div>
                  ) : deleteConfirm?.type === 'owners' && deleteConfirm.index === idx ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-rose-600">Xác nhận xóa?</span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => removeItem('owners', idx)}
                          className="px-2 py-1 bg-rose-600 text-white text-xs rounded hover:bg-rose-700"
                        >
                          Xóa
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded hover:bg-slate-300"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">{item}</span>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditing({ type: 'owners', index: idx, value: item })}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'owners', index: idx })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {config.owners.length === 0 && (
                <p className="text-center text-slate-400 py-4 text-sm italic">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
