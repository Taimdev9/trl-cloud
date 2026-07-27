import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { CreateBotModal } from './components/CreateBotModal';
import { FeedbackModal } from './components/FeedbackModal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { BotsPage } from './pages/BotsPage';
import { BotDetailPage } from './pages/BotDetailPage';
import { CodeEditorPage } from './pages/CodeEditorPage';
import { BotTemplatesPage } from './pages/BotTemplatesPage';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { DocsPage } from './pages/DocsPage';
import { SupportPage } from './pages/SupportPage';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { AIInfoPage } from './pages/AIInfoPage';
import { ChangelogPage } from './pages/ChangelogPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { PageLoading, InitialSplashScreen } from './components/PageLoading';

import { FirstLaunchLanguageModal } from './components/FirstLaunchLanguageModal';
import { OnboardingModal } from './components/OnboardingModal';
import { MobileNav } from './components/MobileNav';
import { BotProject } from './types';
import { AlertCircle, Home } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, getAuthHeader } = useAuth();
  const [activeTab, setActiveTabState] = useState<string>('home');
  const [isChangingTab, setIsChangingTab] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [selectedBotId, setSelectedBotId] = useState<string>('proj-01');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [projects, setProjects] = useState<BotProject[]>([]);

  const setActiveTab = (tab: string) => {
    if (tab === activeTab) return;
    setIsChangingTab(true);
    setActiveTabState(tab);
    setIsSidebarOpen(false); // Auto close sidebar on mobile choice
    setTimeout(() => {
      setIsChangingTab(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 180);
  };

  // Initial loader simulation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleBotCreated = (newBot: BotProject) => {
    setProjects(prev => [newBot, ...prev]);
    setSelectedBotId(newBot.id);
    setActiveTab('bot-detail');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  if (isInitializing) {
    return <InitialSplashScreen />;
  }

  const showSidebar = activeTab !== 'home' && activeTab !== 'login' && activeTab !== 'register';

  const knownTabs = [
    'home', 'dashboard', 'bots', 'bot-detail', 'editor', 'templates',
    'ai-assistant', 'ai-info', 'status', 'docs', 'changelog', 'terms', 'privacy',
    'support', 'about', 'admin', 'profile', 'login', 'register'
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onOpenOnboarding={() => setShowOnboarding(true)}
      />

      <div className="flex-1 flex w-full">
        
        {/* Sidebar for logged-in / app views */}
        {showSidebar && (
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={isSidebarOpen}
            onOpenCreateModal={() => setShowCreateModal(true)}
          />
        )}

        {/* Sidebar Backdrop Overlay on Mobile */}
        {showSidebar && isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)} 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-20 lg:hidden animate-fade-in"
          />
        )}

        {/* Page Views Container */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 ${showSidebar ? 'w-full' : ''}`}>
          {isChangingTab ? (
            <PageLoading message={`Loading ${activeTab.replace('-', ' ')}...`} />
          ) : (
            <>
              {activeTab === 'home' && (
                <LandingPage 
                  setActiveTab={setActiveTab} 
                  onOpenCreateModal={() => setShowCreateModal(true)} 
                />
              )}

              {activeTab === 'dashboard' && (
                <DashboardPage 
                  setActiveTab={setActiveTab} 
                  setSelectedBotId={setSelectedBotId} 
                  onOpenCreateModal={() => setShowCreateModal(true)} 
                />
              )}

              {activeTab === 'bots' && (
                <BotsPage 
                  setActiveTab={setActiveTab} 
                  setSelectedBotId={setSelectedBotId} 
                  onOpenCreateModal={() => setShowCreateModal(true)} 
                />
              )}

              {activeTab === 'bot-detail' && (
                <BotDetailPage 
                  botId={selectedBotId} 
                  setActiveTab={setActiveTab} 
                />
              )}

              {activeTab === 'editor' && (
                <CodeEditorPage 
                  botId={selectedBotId} 
                  setActiveTab={setActiveTab} 
                />
              )}

              {activeTab === 'templates' && (
                <BotTemplatesPage 
                  setActiveTab={setActiveTab} 
                  setSelectedBotId={setSelectedBotId} 
                />
              )}

              {activeTab === 'ai-assistant' && (
                <AIAssistantPage 
                  projects={projects} 
                  token={localStorage.getItem('trl_jwt_token')} 
                />
              )}

              {activeTab === 'ai-info' && <AIInfoPage />}

              {activeTab === 'status' && <SystemStatusPage />}

              {activeTab === 'docs' && <DocsPage />}

              {activeTab === 'changelog' && <ChangelogPage />}

              {activeTab === 'terms' && <TermsPage />}

              {activeTab === 'privacy' && <PrivacyPage />}

              {activeTab === 'support' && <SupportPage />}

              {activeTab === 'about' && <AboutPage />}

              {activeTab === 'admin' && <AdminPage />}

              {activeTab === 'profile' && <ProfilePage />}

              {activeTab === 'login' && <LoginPage setActiveTab={setActiveTab} />}

              {activeTab === 'register' && <RegisterPage setActiveTab={setActiveTab} />}

              {/* 404 Fallback View */}
              {!knownTabs.includes(activeTab) && (
                <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center max-w-md mx-auto space-y-4 my-12">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-extrabold text-white">404 - Page Not Found</h2>
                  <p className="text-xs text-slate-400">The page or view you are looking for does not exist or has been moved.</p>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 hover:bg-cyan-300 transition-all shadow-md"
                  >
                    <Home className="w-4 h-4 text-slate-950" />
                    <span>Return to Home</span>
                  </button>
                </div>
              )}
            </>
          )}
        </main>

      </div>

      {/* Footer */}
      <Footer 
        setActiveTab={setActiveTab} 
        onOpenFeedback={() => setShowFeedbackModal(true)} 
      />

      {/* Mobile Phone Navigation Bar */}
      <MobileNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        toggleSidebar={toggleSidebar} 
      />

      {/* Create Bot Modal */}
      {showCreateModal && (
        <CreateBotModal 
          onClose={() => setShowCreateModal(false)} 
          onCreated={handleBotCreated} 
        />
      )}

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
      />

      {/* First Launch Language Modal */}
      <FirstLaunchLanguageModal 
        onComplete={() => {
          const onboardingDone = localStorage.getItem('trl_cloud_onboarding_completed');
          if (!onboardingDone) {
            setShowOnboarding(true);
          }
        }} 
      />

      {/* Platform Walkthrough Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />

    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <LanguageProvider>
          <MainAppContent />
        </LanguageProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
