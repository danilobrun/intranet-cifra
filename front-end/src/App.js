import { Navigate, Route, Routes } from "react-router-dom";
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
import { AdminAddRoleView } from "./views/AdminAddRole";
import { AdminEditRoleView } from "./views/AdminEditRole";
import { RegisterView } from "./views/Register";
import { EditProfile } from "./views/EditProfile";
import { Addresses } from "./views/Addresses";
import { Contracts } from "./views/Contracts";
import { ContractEditorView } from "./views/ContractEditor";
import { Boletins } from "./views/Boletins";
import { BoletimCreateView } from "./views/BoletimCreate";
import { BoletimEditorView } from "./views/BoletimEditor";
import { BoletinsDeletedView } from "./views/BoletinsDeleted";
import { ForgotPasswordView } from "./views/ForgotPassword";
import { ForgotPasswordCodeView } from "./views/ForgotPasswordCode";
import { ResetPasswordView } from "./views/ResetPassword";
import { ChatbotView } from "./views/Chatbot";
import { TutorialsView } from "./views/Tutorials";
import { TutorialDetailView } from "./views/TutorialDetail";
import { TutorialEditorView } from "./views/TutorialEditor";
import { HomeView } from "./views/Home";
import { canAccessContracts } from "./helpers/contractsPermissions";
import { canAccessBoletins } from "./helpers/boletinsPermissions";
import { canAccessResumoContratos } from "./helpers/resumoContratosPermissions";
import { ResumoContratoDetailView } from "./views/ResumoContratoDetail";
import { ResumoContratoEditorView } from "./views/ResumoContratoEditor";
import { ResumoContratos } from "./views/ResumoContratos";
import { PlatesView } from "./views/Plates";
import { PlateCreateView } from "./views/PlateCreate";
import { InactivePlatesView } from "./views/InactivePlates";
import { CentroCustoFuncionariosView } from "./views/CentroCustoFuncionarios";
import { CentroCustoRegistrarMovimentacaoView } from "./views/CentroCustoRegistrarMovimentacao";
import { CentroCustoMovimentacoesRhView } from "./views/CentroCustoMovimentacoesRh";

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
      <Route path="/recover-password/reset" element={<ResetPasswordView />} />
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
        path="portal/roles/cadastro"
        element={
          <PrivateRoute userTypes={["1"]}>
            <AdminAddRoleView />
          </PrivateRoute>
        }
      />
      <Route
        path="portal/roles/:id"
        element={
          <PrivateRoute userTypes={["1"]}>
            <AdminEditRoleView />
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
        path="/contratos"
        element={
          <PrivateRoute canAccess={canAccessContracts}>
            <Contracts />
          </PrivateRoute>
        }
      />
      <Route
        path="/contratos/novo"
        element={
          <PrivateRoute canAccess={canAccessContracts}>
            <ContractEditorView />
          </PrivateRoute>
        }
      />
      <Route
        path="/contratos/:id/editar"
        element={
          <PrivateRoute canAccess={canAccessContracts}>
            <ContractEditorView />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/contracts"
        element={
          <PrivateRoute canAccess={canAccessContracts}>
            <Navigate to="/contratos" replace />
          </PrivateRoute>
        }
      />
      <Route
        path="/boletins"
        element={
          <PrivateRoute canAccess={canAccessBoletins}>
            <Boletins />
          </PrivateRoute>
        }
      />
      <Route
        path="/boletins/novo"
        element={
          <PrivateRoute canAccess={canAccessBoletins}>
            <BoletimCreateView />
          </PrivateRoute>
        }
      />
      <Route
        path="/boletins/:id/editar"
        element={
          <PrivateRoute canAccess={canAccessBoletins}>
            <BoletimEditorView />
          </PrivateRoute>
        }
      />
      <Route
        path="/boletins/excluidos"
        element={
          <PrivateRoute canAccess={canAccessBoletins}>
            <BoletinsDeletedView />
          </PrivateRoute>
        }
      />
      <Route
        path="/resumo-contratos"
        element={
          <PrivateRoute canAccess={canAccessResumoContratos}>
            <ResumoContratos />
          </PrivateRoute>
        }
      />
      <Route
        path="/resumo-contratos/novo"
        element={
          <PrivateRoute canAccess={canAccessResumoContratos}>
            <ResumoContratoEditorView />
          </PrivateRoute>
        }
      />
      <Route
        path="/resumo-contratos/:id/editar"
        element={
          <PrivateRoute canAccess={canAccessResumoContratos}>
            <ResumoContratoEditorView />
          </PrivateRoute>
        }
      />
      <Route
        path="/resumo-contratos/:id"
        element={
          <PrivateRoute canAccess={canAccessResumoContratos}>
            <ResumoContratoDetailView />
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
      <Route
        path="/portal/tutorials"
        element={
          <PrivateRoute>
            <TutorialsView />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/tutorials/new"
        element={
          <PrivateRoute userTypes={["1"]}>
            <TutorialEditorView />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/tutorials/:id/edit"
        element={
          <PrivateRoute userTypes={["1"]}>
            <TutorialEditorView />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/tutorials/:id"
        element={
          <PrivateRoute>
            <TutorialDetailView />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/centro-custo/funcionarios"
        element={
          <PrivateRoute>
            <CentroCustoFuncionariosView />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/centro-custo/registrar-movimentacao"
        element={
          <PrivateRoute>
            <CentroCustoRegistrarMovimentacaoView />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/centro-custo/movimentacoes"
        element={
          <PrivateRoute>
            <CentroCustoMovimentacoesRhView />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/plates"
        element={
          <PrivateRoute
            userTypes={[
              "1",
              "admin",
              "gerente_frota",
              "auxiliar_frota",
              "coordenador",
              "frota",
            ]}
          >
            <PlatesView />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/plates/novo"
        element={
          <PrivateRoute
            userTypes={[
              "1",
              "admin",
              "gerente_frota",
              "auxiliar_frota",
              "coordenador",
              "frota",
            ]}
          >
            <PlateCreateView />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/plates/:id/editar"
        element={
          <PrivateRoute
            userTypes={[
              "1",
              "admin",
              "gerente_frota",
              "auxiliar_frota",
              "coordenador",
              "frota",
            ]}
          >
            <PlateCreateView />
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/plates/inactive"
        element={
          <PrivateRoute
            userTypes={[
              "1",
              "admin",
              "gerente_frota",
              "auxiliar_frota",
              "frota",
            ]}
          >
            <InactivePlatesView />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
}

export default App;
