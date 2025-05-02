import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeProvider';
import { Sun, Moon, Home, Settings, History, Calculator } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Logo = () => (
  <svg className="w-6 h-6 mr-2" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="100" fill="rgba(255, 255, 255, 0.9)"/>
    <path d="M128 192H384M128 256H384M128 320H384" stroke="white" strokeWidth="32" strokeLinecap="round"/>
    <path d="M192 128L192 384M256 128V384M320 128V384" stroke="white" strokeWidth="32" strokeLinecap="round"/>
  </svg>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar for larger screens */}
      <aside className="w-full md:w-64 md:flex-shrink-0 bg-card border-r border-border hidden md:block">
        <div className="h-full px-3 py-4 flex flex-col">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-primary flex items-center">
              <Logo />
              Calcq
            </h1>
          </div>
          
          <nav className="space-y-1 flex-1">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${
                isActive('/') 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:bg-muted transition-colors'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </Link>
            
            <Link 
              to="/converter" 
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${
                isActive('/converter') 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:bg-muted transition-colors'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span className="text-sm font-medium">Converter</span>
            </Link>
            
            <Link 
              to="/history" 
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${
                isActive('/history') 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:bg-muted transition-colors'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="text-sm font-medium">History</span>
            </Link>
            
            <Link 
              to="/settings" 
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${
                isActive('/settings')
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:bg-muted transition-colors'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </nav>
          
          <div className="mt-auto pt-4 border-t border-border">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full px-3 py-2 rounded-md flex items-center justify-between text-foreground hover:bg-muted transition-colors"
            >
              <span className="text-sm font-medium">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </aside>
      
      {/* Mobile header */}
      <div className="md:hidden bg-card border-b border-border p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary flex items-center">
          <Logo />
          Calcq
        </h1>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
          className="p-1.5 rounded-md text-foreground hover:bg-muted transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : theme === 'light' ? <Moon className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        {children}
      </main>
      
      {/* Mobile navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around p-2">
        <Link 
          to="/" 
          className={`p-1.5 flex flex-col items-center ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span className="text-xs">Home</span>
        </Link>
        <Link 
          to="/converter" 
          className={`p-1.5 flex flex-col items-center ${isActive('/converter') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Calculator className="w-4 h-4 mb-0.5" />
          <span className="text-xs">Converter</span>
        </Link>
        <Link 
          to="/history" 
          className={`p-1.5 flex flex-col items-center ${isActive('/history') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <History className="w-4 h-4 mb-0.5" />
          <span className="text-xs">History</span>
        </Link>
        <Link 
          to="/settings" 
          className={`p-1.5 flex flex-col items-center ${isActive('/settings') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Settings className="w-4 h-4 mb-0.5" />
          <span className="text-xs">Settings</span>
        </Link>
      </nav>
    </div>
  );
};

export default Layout; 