import { Route, Routes } from "react-router-dom";
import { HomeView } from "./views/Home";
import { PortalsView } from "./views/Portals";
import { NotFoundView } from "./views/NotFound";
import { PortalDetailView } from "./views/PortalDetail";
import { DashboardView } from "./views/Dashboard";
import { LoginView } from "./views/Login";
import { PrivateRoute } from "./components/PrivateRoute";
import { AdminPortalsView } from "./views/AdminPortals";
import { AdminAddPortalsView } from "./views/AdminAddPortal";
import { AdminEditPortalView } from "./views/AdminEditPortal";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeView />} />
      <Route
        path="/portals"
        element={
          <PrivateRoute>
            <PortalsView />
          </PrivateRoute>
        }
      />
      <Route path="/portals/:id" element={<PortalDetailView />} />
      <Route
        path="/portal"
        element={
          <PrivateRoute>
            <DashboardView />
          </PrivateRoute>
        }
      />
      <Route
        path="portal/portals"
        element={
          <PrivateRoute userTypes={[1]}>
            <AdminPortalsView />
          </PrivateRoute>
        }
      />
      <Route
        path="portal/portals/cadastro"
        element={
          <PrivateRoute userTypes={[1]}>
            <AdminAddPortalsView />
          </PrivateRoute>
        }
      />
      <Route
        path="portal/portals/:id"
        element={
          <PrivateRoute userTypes={[1]}>
            <AdminEditPortalView />
          </PrivateRoute>
        }
      />
      <Route path="/portal/login" element={<LoginView />} />
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
}

export default App;
