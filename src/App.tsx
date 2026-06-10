import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider, useRouter } from './hooks/useRouter';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { InterviewsPage } from './pages/InterviewsPage';
import { InterviewDetailPage } from './pages/InterviewDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminInterviewsPage } from './pages/AdminInterviewsPage';
import { AdminInterviewFormPage } from './pages/AdminInterviewFormPage';
import { AdminCommentsPage } from './pages/AdminCommentsPage';
import { AdminHeroSlidesPage } from './pages/AdminHeroSlidesPage';
import { AdminCorrespondentsPage } from './pages/AdminCorrespondentsPage';

function AppContent() {
  const { currentPath } = useRouter();

  const renderPage = () => {
    if (currentPath === '/') return <HomePage />;
    if (currentPath === '/interviews') return <InterviewsPage />;
    if (currentPath.startsWith('/interview/')) return <InterviewDetailPage />;
    if (currentPath === '/about') return <AboutPage />;
    if (currentPath === '/contact') return <ContactPage />;
    if (currentPath === '/admin/login') return <AdminLoginPage />;
    if (currentPath === '/admin') return <AdminDashboard />;
    if (currentPath === '/admin/interviews') return <AdminInterviewsPage />;
    if (currentPath === '/admin/interviews/new') return <AdminInterviewFormPage />;
    if (currentPath.startsWith('/admin/interviews/edit/')) return <AdminInterviewFormPage />;
    if (currentPath === '/admin/comments') return <AdminCommentsPage />;
    if (currentPath === '/admin/hero-slides') return <AdminHeroSlidesPage />;
    if (currentPath === '/admin/correspondents') return <AdminCorrespondentsPage />;

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">404</h1>
          <p className="text-gray-400">Sayfa bulunamadı</p>
        </div>
      </div>
    );
  };

  const isAdminLoginPage = currentPath === '/admin/login';

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {!isAdminLoginPage && <Header />}
      <main className="flex-1">{renderPage()}</main>
      {!isAdminLoginPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AuthProvider>
  );
}

export default App;
