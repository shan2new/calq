import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeProvider';
import { UserProvider } from './contexts/UserContext';
import './index.css';

// Pages
import Home from './pages/Home';
// import Converter from './pages/Converter';
import History from './pages/History';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import ConverterWithSpecialized from './pages/ConverterWithSpecialized';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/converter" element={<ConverterWithSpecialized />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App; 