import React, { useState } from 'react';
import {
  Shield,
  Search,
  UserCheck,
  AlertTriangle,
  Scale,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenSearch: () => void;
  activeCaseNumber?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, activeCaseNumber }) => {
  const { user, role, setRole } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles: UserRole[] = ['ADMIN', 'INVESTIGATOR', 'VIEWER'];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md">
      {/* Brand & Platform Identifier */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-amber-400 shadow-sm">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-slate-900 text-lg">CourtLens</span>
              <span className="text-xs font-medium text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">v1.0 Fed-Auth</span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">Evidence & Case Intelligence</p>
          </div>
        </div>

        {activeCaseNumber && (
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 text-xs text-slate-600">
            <span className="text-slate-400 font-mono">DOCKET:</span>
            <span className="font-mono font-medium text-slate-900">{activeCaseNumber}</span>
          </div>
        )}
      </div>

      {/* Center Search Trigger */}
      <div className="flex-1 max-w-md mx-6 hidden sm:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <Search className="h-4 w-4 text-slate-400" />
            <span>Search cases, evidence SHA-256, transcripts...</span>
          </div>
          <kbd className="hidden sm:inline-block font-mono text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Role Switcher & User Status */}
      <div className="flex items-center gap-4">
        {/* Role Demo Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors"
            title="Switch User Role for Evaluation"
          >
            <Shield className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-500 font-normal">Role:</span>
            <span className="font-semibold text-slate-900">{role}</span>
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg z-50">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Evaluation Role
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md text-left transition-colors ${
                    role === r ? 'bg-slate-900 text-white font-medium' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{r}</span>
                  {role === r && <span className="text-[10px] opacity-80">Active</span>}
                </button>
              ))}
              <div className="mt-1.5 border-t border-slate-100 pt-1.5 px-2 text-[10px] text-slate-400">
                Switches permissions in real-time
              </div>
            </div>
          )}
        </div>

        {/* Current User Pill */}
        <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-medium text-xs">
            {user?.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'CL'}
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-slate-900 leading-tight">{user?.full_name}</p>
            <p className="text-[10px] text-slate-500 leading-tight">{user?.organization}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
