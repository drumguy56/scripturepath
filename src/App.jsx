import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Home from '@/pages/Home';
import Library from '@/pages/Library';
import StudyDetail from '@/pages/StudyDetail';
import Lesson from '@/pages/Lesson';
import Journal from '@/pages/Journal';
import Read from '@/pages/Read';
import Groups from '@/pages/Groups';
import GroupDetail from '@/pages/GroupDetail';
import OAuthAuthorize from '@/pages/OAuthAuthorize';

const LoginRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<LoginRedirect />} />}>
        <Route path="/oauth/authorize" element={<OAuthAuthorize />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/study/:studyId" element={<StudyDetail />} />
          <Route path="/study/:studyId/lesson/:lessonId" element={<Lesson />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/read" element={<Read />} />
          <Route path="/read/:bookSlug/:chapter" element={<Read />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:groupId" element={<GroupDetail />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App