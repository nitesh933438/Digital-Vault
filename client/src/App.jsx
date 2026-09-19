import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useLayoutEffect } from "react";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import NotFound from "./pages/NotFound/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";
import Documents from "./pages/Documents/Documents";
import Favorites from "./pages/Favorites/Favorites";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";
import { Toaster } from "react-hot-toast";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Notifications from "./pages/Notifications/Notifications";
import Privacy from "./pages/Privacy/Privacy";
import Terms from "./pages/Terms/Terms";
import InstallApp from "./components/InstallApp/InstallApp";
import NotificationWatcher from "./components/NotificationWatcher";
import Sidebar from "./components/Sidebar/Sidebar";
import Topbar from "./components/Topbar/Topbar";
import Footer from "./components/Footer/Footer";
import Admin from "./pages/Admin/Admin";
import { useAuth } from "./context/AuthContext";


function RouteScrollManager() {
  const location = useLocation();

  const resetAllScrollPositions = () => {
    // The app should always enter a newly navigated route at its top.
    // Reset the document scroller plus any accidental nested scrollers.
    try { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); } catch {}
    try { document.scrollingElement && (document.scrollingElement.scrollTop = 0); } catch {}
    try { document.documentElement.scrollTop = 0; } catch {}
    try { document.body.scrollTop = 0; } catch {}

    document.querySelectorAll("* ").forEach((element) => {
      if (element.scrollTop > 0 && element !== document.body && element !== document.documentElement) {
        const style = window.getComputedStyle(element);
        if (/(auto|scroll|overlay)/.test(`${style.overflowY} ${style.overflow}`)) {
          element.scrollTop = 0;
        }
      }
    });
  };

  useLayoutEffect(() => {
    try { window.history.scrollRestoration = "manual"; } catch {}
    resetAllScrollPositions();
  }, [location.pathname, location.search, location.hash, location.key]);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    try { window.history.scrollRestoration = "manual"; } catch {}

    const reset = () => resetAllScrollPositions();
    const frame1 = window.requestAnimationFrame(reset);
    const frame2 = window.requestAnimationFrame(() => window.requestAnimationFrame(reset));
    const timer1 = window.setTimeout(reset, 60);
    const timer2 = window.setTimeout(reset, 250);
    const timer3 = window.setTimeout(reset, 600);

    return () => {
      window.cancelAnimationFrame(frame1);
      window.cancelAnimationFrame(frame2);
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
      window.clearTimeout(timer3);
      try { window.history.scrollRestoration = previous || "auto"; } catch {}
    };
  }, [location.pathname, location.search, location.hash, location.key]);

  return null;
}

function AuthRedirect() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user) return;

    // After a successful Google popup sign-in, Firebase updates auth state
    // without leaving the current page. Move authenticated users away from
    // public auth screens to their protected destination.
    const onPublicEntry =
      location.pathname === "/" ||
      location.pathname === "/login" ||
      location.pathname === "/register";

    if (onPublicEntry) {
      navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
      return;
    }

    // Also prevent an already-authenticated user from getting stuck on the
    // login/register screens after a page refresh.
    if (location.pathname === "/login" || location.pathname === "/register") {
      navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
    }
  }, [user, loading, isAdmin, location.pathname, navigate]);

  return null;
}

function AuthenticatedPageLayout({ children }) {
  return (
    <div className="app-page-shell">
      <Sidebar />
      <main className="app-page-main">
        <Topbar />
        <div className="app-page-content">{children}</div>
        <Footer />
      </main>
    </div>
  );
}


function App() {
  return (
    <HashRouter>
      <AuthRedirect />
      <RouteScrollManager />
  <Toaster
    position="top-right"
    reverseOrder={false}
  />

      <NotificationWatcher />
      <InstallApp />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
        <Route path="/documents" element={
  <ProtectedRoute>
    <AuthenticatedPageLayout><Documents /></AuthenticatedPageLayout>
  </ProtectedRoute>
}/>

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <AuthenticatedPageLayout><Favorites /></AuthenticatedPageLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AuthenticatedPageLayout><Profile /></AuthenticatedPageLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AuthenticatedPageLayout><Settings /></AuthenticatedPageLayout>
            </ProtectedRoute>
          }
        />

<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

<Route
  path="/notifications"
  element={
    <ProtectedRoute>
      <AuthenticatedPageLayout><Notifications /></AuthenticatedPageLayout>
    </ProtectedRoute>
  }
/>

<Route
path="/privacy"
element={<Privacy/>}
/>

<Route
path="/terms"
element={<Terms/>}
/>

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

export default App;