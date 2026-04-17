import { Route, Routes } from "react-router-dom";
import { HomeView } from "./views/Home";
import { PortalsView } from "./views/Portals";
import { NotFoundView } from "./views/NotFound";
import { PortalDetailView } from "./views/PortalDetail";
import { DashboardView } from "./views/Dashboard";
import { PrivateRoute } from "./components/PrivateRoute";
import { AdminPortalsView } from "./views/AdminPortals";
import { AdminAddPortalsView } from "./views/AdminAddPortal";
import { AdminEditPortalView } from "./views/AdminEditPortal";
import { EletronicDiary } from "./views/EletronicDiary";
import { AdminUsersView } from "./views/AdminUsers";
import { AdminEditUserView } from "./views/AdminEditUser";
import { AdminAddUserView } from "./views/AdminAddUser";
import { AdminRolesView } from "./views/AdminRoles";
import { RegisterView } from "./views/Register";
import { EditProfile } from "./views/EditProfile";
import { Addresses } from "./views/Addresses";
import { Contracts } from "./views/Contracts";
import { ForgotPasswordView } from "./views/ForgotPassword";
import { ForgotPasswordCodeView } from "./views/ForgotPasswordCode";
import { ResetPasswordView } from "./views/ResetPassword";
import { ChatbotView } from "./views/Chatbot";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeView />} />
      <Route path="/register" element={<RegisterView />} />
      <Route path="/recover-password" element={<ForgotPasswordView />} />
      <Route
        path="/recover-password/code"
        element={<ForgotPasswordCodeView />}
      />
      <Route
        path="/recover-password/reset"
        element={<ResetPasswordView />}
      />
      <Route
        path="/portals"
        element={
          <PrivateRoute>
            <PortalsView />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/editProfile/:id"
        element={
          <PrivateRoute>
            <EditProfile />
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
          <PrivateRoute userTypes={["1"]}>
            <AdminPortalsView />
          </PrivateRoute>
        }
      />
      <Route
        path="portal/users"
        element={
          <PrivateRoute userTypes={["1"]}>
            <AdminUsersView />
          </PrivateRoute>
        }
      />
      <Route
        path="portal/roles"
        element={
          <PrivateRoute userTypes={["1"]}>
            <AdminRolesView />
          </PrivateRoute>
        }
      />
      <Route
        path="portal/users/:id"
        element={
          <PrivateRoute userTypes={["1"]}>
            <AdminEditUserView />
          </PrivateRoute>
        }
      />
      <Route
        path="portal/portals/cadastro"
        element={
          <PrivateRoute userTypes={["1"]}>
            <AdminAddPortalsView />
          </PrivateRoute>
        }
      />
      <Route
        path="portal/portals/:id"
        element={
          <PrivateRoute userTypes={["1"]}>
            <AdminEditPortalView />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/admin-login"
        element={
          <PrivateRoute userTypes={["1"]}>
            <AdminAddUserView />
          </PrivateRoute>
        }
      />
      <Route
        path="/diary"
        element={
          <PrivateRoute
            userTypes={[
              "1",
              "compesa",
              "brk",
              "verdeAlagoas",
              "alagoasGerente",
              "sergipe",
              "igua",
              "obras",
              "compras",
              "almoxarifado",
              "rh",
              "financeiro",
              "frota",
              "3",
            ]}
          >
            <EletronicDiary />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/addresses"
        element={
          <PrivateRoute
            userTypes={[
              "1",
              "compesa",
              "brk",
              "verdeAlagoas",
              "alagoasGerente",
              "sergipe",
              "igua",
              "obras",
              "compras",
              "almoxarifado",
              "rh",
              "financeiro",
              "frota",
              "3",
            ]}
          >
            <Addresses />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/contracts"
        element={
          <PrivateRoute
            userTypes={[
              "1",
              "compesa",
              "brk",
              "verdeAlagoas",
              "alagoasGerente",
              "sergipe",
              "igua",
              "obras",
              "compras",
              "almoxarifado",
              "rh",
              "financeiro",
              "frota",
              "3",
            ]}
          >
            <Contracts />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/chatbot"
        element={
          <PrivateRoute userTypes={["1"]}>
            <ChatbotView />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
}

export default App;
