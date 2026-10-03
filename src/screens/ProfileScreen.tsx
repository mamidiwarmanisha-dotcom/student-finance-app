import React, { useEffect, useState } from 'react';
import { repository } from '../data/localStorageRepository';
import type { User, Category } from '../types/models';
import { Button } from '../components/common/Button';
import { CategoryIcon } from '../components/common/CategoryIcon';
import {
  User as UserIcon,
  Download,
  Trash2,
  Tags,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [currencyInput, setCurrencyInput] = useState('INR');
  const [savedSuccess, setSavedSuccess] = useState(false);

  async function loadData() {
    const u = await repository.getUser();
    setUser(u);
    setNameInput(u.name);
    setCurrencyInput(u.currency);
    const cats = await repository.getCategories();
    setCategories(cats);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const updated = await repository.updateUser({
      name: nameInput.trim(),
      currency: currencyInput,
    });
    setUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportData = async () => {
    const jsonStr = await repository.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_finance_backup_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        'Are you sure you want to reset all data? This will clear all transactions, budgets, and alerts.'
      )
    ) {
      await repository.clearAllData();
      await loadData();
      alert('All application data has been reset to defaults.');
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Profile & Currency Form */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <UserIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold">Student Profile & Currency</h2>
          </div>
          {user && (
            <span className="text-[10px] text-slate-400">
              Joined {new Date(user.created_at).toLocaleDateString()}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full text-sm font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Currency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'INR', label: '₹ INR' },
                { code: 'USD', label: '$ USD' },
                { code: 'EUR', label: '€ EUR' },
              ].map((cur) => (
                <button
                  type="button"
                  key={cur.code}
                  onClick={() => setCurrencyInput(cur.code)}
                  className={`py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                    currencyInput === cur.code
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cur.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" variant="primary" size="md" fullWidth>
              Save Settings
            </Button>
            {savedSuccess && (
              <span className="flex items-center text-xs text-emerald-600 font-semibold gap-1">
                <CheckCircle className="w-4 h-4" /> Saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Categories View */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-800">
          <Tags className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Default Categories ({categories.length})
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
            >
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
              >
                <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
              </span>
              <span className="font-semibold text-slate-700">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy & Offline Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <p className="font-bold">100% Private & Offline (MVP)</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Your financial data is stored securely on your local device. No bank login or
            cloud sync required.
          </p>
        </div>
      </div>

      {/* Data Export & Reset */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Data Management
        </h3>

        <div className="space-y-2">
          <Button
            variant="outline"
            fullWidth
            size="md"
            onClick={handleExportData}
            className="flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Data as JSON</span>
          </Button>

          <Button
            variant="danger"
            fullWidth
            size="md"
            onClick={handleResetData}
            className="flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset All App Data</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
