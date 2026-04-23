import { Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/features/auth/context";
import { FamilyProvider } from "@/features/family/context";

import Dashboard from "./pages/Dashboard";
import AuthPage from "@/features/auth/page";
import CalendarPage from "./pages/Calendar";
import ChoresPage from "./pages/Chores";
import BudgetPage from "./pages/Budget";
import AlcoholPage from "./pages/Alcohol";
import FamilyPage from "./pages/Family";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <FamilyProvider>{children}</FamilyProvider>;
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  return (
    <Routes>
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/chores" element={<ProtectedRoute><ChoresPage /></ProtectedRoute>} />
      <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
      <Route path="/alcohol" element={<ProtectedRoute><AlcoholPage /></ProtectedRoute>} />
      <Route path="/family" element={<ProtectedRoute><FamilyPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;