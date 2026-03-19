import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Dumbbell,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AlertBanner } from "./components/AlertBanner";
import { KpiCards } from "./components/KpiCards";
import { MembersTable } from "./components/MembersTable";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetAllMembers,
  useGetDashboardStats,
  useIsAdmin,
} from "./hooks/useQueries";

const queryClient = new QueryClient();

type Page = "dashboard" | "members";

const SKELETON_KEYS_4 = ["s1", "s2", "s3", "s4"];
const SKELETON_KEYS_5 = ["s1", "s2", "s3", "s4", "s5"];
const SKELETON_KEYS_8 = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];

function AppInner() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const { data: members = [], isLoading: membersLoading } = useGetAllMembers();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: isAdmin = false } = useIsAdmin();

  // Touch swipe support
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
      if (dy > 60) return; // vertical swipe, ignore
      if (!sidebarOpen && touchStartX.current < 30 && dx > 50) {
        setSidebarOpen(true);
      } else if (sidebarOpen && dx < -50) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [sidebarOpen]);

  const navItems = [
    { key: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
    { key: "members" as Page, label: "Members", icon: Users },
  ];

  const handleNavClick = (key: Page) => {
    setPage(key);
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-sidebar border-b border-sidebar-border flex items-center px-4 gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-foreground hover:bg-sidebar-accent transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="p-1 bg-primary rounded-md">
            <Dumbbell className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-foreground text-base font-bold tracking-wide">
            GYMFLOW
          </span>
        </div>
        {/* Auth compact button in navbar */}
        {isLoggedIn ? (
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            data-ocid="auth.logout.button"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={login}
            disabled={loginStatus === "logging-in"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
            data-ocid="auth.login.button"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>{loginStatus === "logging-in" ? "..." : "Sign In"}</span>
          </button>
        )}
      </header>

      {/* Sidebar Drawer Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 h-full z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-sidebar-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary rounded-lg">
                  <Dumbbell className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-foreground text-lg font-bold tracking-wide">
                  GYMFLOW
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => handleNavClick(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    page === key
                      ? "bg-primary/15 text-primary"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                  data-ocid={`nav.${key}.link`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </nav>

            {/* Auth */}
            <div className="px-3 py-4 border-t border-sidebar-border">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground px-3 truncate">
                    {identity.getPrincipal().toString().slice(0, 20)}...
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      clear();
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                    data-ocid="auth.logout.button"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    login();
                    setSidebarOpen(false);
                  }}
                  disabled={loginStatus === "logging-in"}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
                  data-ocid="auth.login.button"
                >
                  <LogIn className="h-4 w-4" />
                  {loginStatus === "logging-in" ? "Signing in..." : "Sign In"}
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-14">
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
          {/* Alert banner */}
          {members.length > 0 && <AlertBanner members={members} />}

          {page === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                  Dashboard
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Overview of your gym membership status
                </p>
              </div>

              {statsLoading ? (
                <div
                  className="grid grid-cols-2 gap-3"
                  data-ocid="dashboard.loading_state"
                >
                  {SKELETON_KEYS_4.map((k) => (
                    <Skeleton key={k} className="h-28 rounded-xl bg-card" />
                  ))}
                </div>
              ) : (
                <KpiCards
                  totalMembers={stats ? Number(stats.totalMembers) : 0}
                  activeMembers={stats ? Number(stats.activeMembers) : 0}
                  expiredMembers={stats ? Number(stats.expiredMembers) : 0}
                  expiringSoon={stats ? Number(stats.expiringSoon) : 0}
                />
              )}

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  Recent Members
                </h2>
                {membersLoading ? (
                  <div className="space-y-2" data-ocid="members.loading_state">
                    {SKELETON_KEYS_5.map((k) => (
                      <Skeleton key={k} className="h-20 rounded-xl bg-card" />
                    ))}
                  </div>
                ) : (
                  <MembersTable
                    members={members.slice(0, 5)}
                    isAdmin={isAdmin}
                  />
                )}
              </div>
            </motion.div>
          )}

          {page === "members" && (
            <motion.div
              key="members"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                  Members
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Manage all gym members and their memberships
                </p>
              </div>

              {membersLoading ? (
                <div className="space-y-2" data-ocid="members.loading_state">
                  {SKELETON_KEYS_8.map((k) => (
                    <Skeleton key={k} className="h-20 rounded-xl bg-card" />
                  ))}
                </div>
              ) : (
                <MembersTable members={members} isAdmin={isAdmin} />
              )}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-border px-4 py-4 text-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster />
    </QueryClientProvider>
  );
}
