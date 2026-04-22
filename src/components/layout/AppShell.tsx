"use client";

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  Wallet, 
  Wine, 
  Users, 
  Menu, 
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/calendar', label: 'Calendrier', icon: Calendar },
  { href: '/chores', label: 'Corvées', icon: CheckSquare },
  { href: '/budget', label: 'Budget', icon: Wallet },
  { href: '/alcohol', label: 'Alcool', icon: Wine },
  { href: '/family', label: 'Famille', icon: Users },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { family, members } = useFamily();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Desktop */}
      {!isMobile && (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-border px-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-lg">
                F
              </div>
              <div>
                <h1 className="font-bold text-lg">Family Hub</h1>
                <p className="text-xs text-muted-foreground">
                  {family?.name || 'Pas de famille'}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary/80 text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile header */}
      {isMobile && (
        <header className="fixed left-0 right-0 top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white font-bold">
                F
              </div>
              <span className="font-bold">Family Hub</span>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-muted transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <aside 
          className={cn(
            'fixed left-0 top-0 z-50 h-full w-72 border-r border-border bg-card transition-transform duration-300',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-lg">
                  F
                </div>
                <div>
                  <h1 className="font-bold text-lg">Family Hub</h1>
                  <p className="text-xs text-muted-foreground">
                    {family?.name || 'Pas de famille'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Members */}
            {family && members.length > 0 && (
              <div className="border-t border-border p-4">
                <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
                  Membres ({members.length})
                </p>
                <div className="space-y-2">
                  {members.slice(0, 4).map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 text-secondary text-xs font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm truncate">{member.name}</span>
                      {member.role === 'admin' && (
                        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border p-4">
              <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary/80 text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main 
        className={cn(
          'min-h-screen transition-all duration-300',
          !isMobile && 'ml-64'
        )}
      >
        <div className={cn(
          'p-6 pt-4',
          isMobile && 'pt-20'
        )}>
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm safe-bottom">
          <div className="flex h-16 items-center justify-around">
            {navItems.slice(0, 5).map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};