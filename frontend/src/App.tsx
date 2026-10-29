import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InterviewProvider } from './contexts/InterviewContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import RequireAuth from './components/RequireAuth';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import SetupPage from './pages/SetupPage';
import PreparingPage from './pages/PreparingPage';
import InterviewPage from './pages/InterviewPage';
import ReportPage from './pages/ReportPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InterviewProvider>
        <BrowserRouter>
          <AuthProvider>
            <Navbar />
            <PageTransition>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/register" element={<AuthPage mode="register" />} />
                <Route element={<RequireAuth />}>
                  <Route path="/setup" element={<SetupPage />} />
                  <Route path="/preparing" element={<PreparingPage />} />
                  <Route path="/interview" element={<InterviewPage />} />
                  <Route path="/report" element={<ReportPage />} />
                </Route>
              </Routes>
            </PageTransition>
          </AuthProvider>
        </BrowserRouter>
      </InterviewProvider>
    </QueryClientProvider>
  );
}
