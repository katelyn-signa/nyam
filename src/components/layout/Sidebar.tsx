import React from 'react';
import {
  LayoutDashboard,
  FolderLock,
  FileCheck,
  Search,
  Clock,
  History,
  Settings,
  BookOpen,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 'dashboard' | 'cases' | 'evidence' | 'search' | 'audit' | 'settings' | 'docs';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  caseCount?: number;
  evidenceCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  caseCount = 3,
  evidenceCount = 3
}) => {
  const { role } = useAuth();

  const primaryNav = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases' as NavTab, label: 'Case Management', icon: FolderLock, count: caseCount },
    { id: 'evidence' as NavTab, label: 'Evidence Vault', icon: FileCheck, count: evidenceCount },
    { id: 'search' as NavTab, label: 'Global Intelligence Search', icon: Search },
    { id: 'audit' as NavTab, label: 'Audit & Custody Logs', icon: History }
  ];

  const secondaryNav = [
    { id: 'docs' as NavTab, label: 'System Architecture & Docs', icon: BookOpen },
    { id: 'settings' as NavTab, label: 'Settings & AI Engine', icon: Settings }
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Navigation Group */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Intelligence Command
          </div>
          <nav className="space-y-1">
            {primaryNav.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System & Architecture */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            System & Governance
          </div>
          <nav className="space-y-1">
            {secondaryNav.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Forensic Guarantee Banner at bottom */}
      <div className="p-4 m-3 rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Forensic Integrity Seal</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
          SHA-256 cryptographic digest calculated server-side upon upload. Zero tampering tolerance.
        </p>
        <div className="mt-2 text-[10px] text-slate-400 font-mono">
          FED-STD-180 / NIST SP 800-86
        </div>
      </div>
    </aside>
  );
};
