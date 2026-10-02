/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { EvidenceVaultPage } from './pages/EvidenceVaultPage';
import { SearchPage } from './pages/SearchPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { DocsPage } from './pages/DocsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NewCaseModal } from './components/cases/NewCaseModal';
import { api } from './lib/api';
import { Case, EvidenceItem, DashboardStatistics } from './types';

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);

  const [cases, setCases] = useState<Case[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load all initial state
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [casesRes, evidenceRes, statsRes] = await Promise.all([
        api.getCases(),
        api.getEvidenceList(),
        api.getDashboardStats()
      ]);

      if (casesRes.success) setCases(casesRes.data);
      if (evidenceRes.success) setEvidenceList(evidenceRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load initial courtlens data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCurrentTab('search');
        setSelectedCaseId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentTab('cases');
  };

  const handleSelectEvidence = (evidenceId: string) => {
    const targetItem = evidenceList.find(e => e.id === evidenceId);
    if (targetItem) {
      setSelectedCaseId(targetItem.case_id);
      setCurrentTab('cases');
    } else {
      setCurrentTab('evidence');
    }
  };

  const handleCaseCreated = (createdCase: Case) => {
    setCases(prev => [createdCase, ...prev]);
    loadInitialData();
    handleSelectCase(createdCase.id);
  };

  const activeCase = cases.find(c => c.id === selectedCaseId);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-amber-200 selection:text-slate-900">
      {/* Top Navbar */}
      <Navbar
        onOpenSearch={() => {
          setCurrentTab('search');
          setSelectedCaseId(null);
        }}
        activeCaseNumber={activeCase?.case_number}
      />

      {/* Main Body with Sidebar & Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => {
            setCurrentTab(tab);
            if (tab !== 'cases') {
              setSelectedCaseId(null);
            }
          }}
          caseCount={cases.length}
          evidenceCount={evidenceList.length}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto bg-slate-100/70">
          {selectedCaseId ? (
            <CaseDetailPage
              caseId={selectedCaseId}
              onBack={() => setSelectedCaseId(null)}
              onSelectEvidence={handleSelectEvidence}
            />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardPage
                  stats={stats}
                  isLoading={isLoading}
                  onOpenNewCase={() => setIsNewCaseModalOpen(true)}
                  onSelectCase={handleSelectCase}
                  onSelectEvidence={handleSelectEvidence}
                  onNavigateTab={tab => {
                    setCurrentTab(tab);
                    setSelectedCaseId(null);
                  }}
                />
              )}

              {currentTab === 'cases' && (
                <CasesPage
                  cases={cases}
                  isLoading={isLoading}
                  onSelectCase={handleSelectCase}
                  onOpenNewCase={() => setIsNewCaseModalOpen(true)}
                />
              )}

              {currentTab === 'evidence' && (
                <EvidenceVaultPage
                  evidenceList={evidenceList}
                  isLoading={isLoading}
                  onRefresh={loadInitialData}
                  onSelectCase={handleSelectCase}
                />
              )}

              {currentTab === 'search' && (
                <SearchPage
                  onSelectCase={handleSelectCase}
                  onSelectEvidence={handleSelectEvidence}
                />
              )}

              {currentTab === 'audit' && <AuditLogPage />}

              {currentTab === 'docs' && <DocsPage />}

              {currentTab === 'settings' && <SettingsPage />}
            </>
          )}
        </main>
      </div>

      {/* New Case Creation Modal */}
      <NewCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
        onCaseCreated={handleCaseCreated}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
