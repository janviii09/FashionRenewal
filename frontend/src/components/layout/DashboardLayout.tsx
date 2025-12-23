import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shirt, 
  ShoppingBag, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/wardrobe', label: 'My Wardrobe', icon: Shirt },
  { href: '/dashboard/orders', label: 'My Orders', icon: ShoppingBag },
  { href: '/dashboard/rentals', label: 'Rentals', icon: Calendar },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:relative",
          isSidebarOpen ? "w-64" : "w-20",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link 
            to="/" 
            className={cn(
              "flex items-center gap-2 transition-opacity",
              !isSidebarOpen && "lg:justify-center"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-bg">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            {isSidebarOpen && (
              <span className="text-lg font-bold gradient-text">FashionRenewal</span>
            )}
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive(link.href)
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      !isSidebarOpen && "lg:justify-center lg:px-2"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {isSidebarOpen && <span>{link.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4">
          <div className={cn(
            "flex items-center gap-3 rounded-lg bg-sidebar-accent p-3",
            !isSidebarOpen && "lg:justify-center lg:p-2"
          )}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {user?.name || 'User'}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              "mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
              !isSidebarOpen && "lg:justify-center lg:px-2"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span>Log Out</span>}
          </button>
        </div>

        {/* Collapse Button (Desktop) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar shadow-sm transition-transform hover:scale-110 lg:flex"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            !isSidebarOpen && "rotate-180"
          )} />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-xl lg:px-6">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Link to="/browse">
            <Button variant="outline" size="sm">
              Browse Marketplace
            </Button>
          </Link>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
