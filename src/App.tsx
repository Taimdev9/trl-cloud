import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { CreateBotModal } from './components/CreateBotModal';

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

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedBotId, setSelectedBotId] = useState<string>('proj-01');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleBotCreated = (id: string) => {
    setSelectedBotId(id);
    setActiveTab('bot-detail');
  };

  const showSidebar = user && ['dashboard', 'bots', 'bot-detail', 'editor', 'templates', 'status', 'docs', 'support', 'about', 'admin', 'profile'].includes(activeTab);

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Dashboard Sidebar */}
        {showSidebar && (
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={isSidebarOpen}
            onOpenCreateModal={() => setShowCreateModal(true)}
          />
        )}

        {/* Page Views Container */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${showSidebar ? 'w-full' : ''}`}>
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

          {activeTab === 'status' && <SystemStatusPage />}

          {activeTab === 'docs' && <DocsPage />}

          {activeTab === 'support' && <SupportPage />}

          {activeTab === 'about' && <AboutPage />}

          {activeTab === 'admin' && <AdminPage />}

          {activeTab === 'profile' && <ProfilePage />}

          {activeTab === 'login' && <LoginPage setActiveTab={setActiveTab} />}

          {activeTab === 'register' && <RegisterPage setActiveTab={setActiveTab} />}
        </main>

      </div>

      {/* Footer */}
      <Footer />

      {/* Create Bot Modal */}
      {showCreateModal && (
        <CreateBotModal 
          onClose={() => setShowCreateModal(false)} 
          onCreated={handleBotCreated} 
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainAppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
