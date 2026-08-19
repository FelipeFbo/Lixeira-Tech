import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { AuthProvider } from "./store/AuthContext";
import { ThemeProvider } from "./store/ThemeContext";
import { ProtectedRoute } from "./components/ui/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Ranking from "./pages/Ranking";
import Deposit from "./pages/Deposit";
import Admin from "./pages/Admin";
import WorldPanorama from "./pages/WorldPanorama";
import Museum from "./pages/Museum";
import MuseumDetail from "./pages/MuseumDetail";
import Kiosk from "./pages/Kiosk";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/quiosque" element={<Kiosk />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Signup />} />
            <Route path="/panorama" element={<WorldPanorama />} />
            <Route path="/museu" element={<Museum />} />
            <Route path="/museu/:slug" element={<MuseumDetail />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ranking"
              element={
                <ProtectedRoute>
                  <Ranking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/depositar"
              element={
                <ProtectedRoute>
                  <Deposit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
