import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { FamilyProvider } from "@/contexts/FamilyContext";
import { AppShell } from "@/components/layout/AppShell";

import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import CalendarPage from "./pages/Calendar";
import ChoresPage from "./pages/Chores";
import BudgetPage from "./pages/Budget";
import AlcoholTrackerPage from "./pages/AlcoholTracker";
import FamilyPage from "./pages/Family";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <FamilyProvider>{children}</FamilyProvider>;
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell>
              <Index />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <AppShell>
              <CalendarPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chores"
        element={
          <ProtectedRoute>
            <AppShell>
              <ChoresPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/budget"
        element={
          <ProtectedRoute>
            <AppShell>
              <BudgetPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alcohol"
        element={
          <ProtectedRoute>
            <AppShell>
              <AlcoholTrackerPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/family"
        element={
          <ProtectedRoute>
            <AppShell>
              <FamilyPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;