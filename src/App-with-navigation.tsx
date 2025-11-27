import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { DiscoveryPortal } from './components/DiscoveryPortal';
import { AdlsDataBrowserPage } from './pages/AdlsDataBrowserPage';
import { Button } from './components/ui/button';
import { Database, FileSearch } from 'lucide-react';

type Page = 'discovery' | 'adls-browser';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [currentPage, setCurrentPage] = useState<Page>('discovery');

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setCurrentPage('discovery');
  };

  // Login screen
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Navigation bar component
  const NavigationBar = () => (
    <div className="bg-white border-b shadow-sm">
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Data Engineering Portal</h2>
            <div className="flex gap-2">
              <Button
                variant={currentPage === 'discovery' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage('discovery')}
              >
                <FileSearch className="w-4 h-4 mr-2" />
                Discovery Portal
              </Button>
              <Button
                variant={currentPage === 'adls-browser' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage('adls-browser')}
              >
                <Database className="w-4 h-4 mr-2" />
                ADLS Browser
              </Button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Welcome, {currentUser}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Discovery Portal page
  if (currentPage === 'discovery') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <NavigationBar />
        <DiscoveryPortal currentUser={currentUser} onLogout={handleLogout} />
      </div>
    );
  }

  // ADLS Browser page
  if (currentPage === 'adls-browser') {
    return (
      <>
        <NavigationBar />
        <AdlsDataBrowserPage 
          currentUser={currentUser}
          onBack={() => setCurrentPage('discovery')}
        />
      </>
    );
  }

  return null;
}
