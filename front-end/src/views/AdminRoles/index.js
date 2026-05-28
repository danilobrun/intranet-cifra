import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import styled from "styled-components";
import { toast } from "react-toastify";
import { LayoutPortal } from "../../components/LayoutPortal";
import { Loading } from "../../components/Loading";
import {
  createRole,
  getRoleById,
  getRolePortalOptions,
  getRoles,
  updateRole,
} from "../../services/Roles.service";
import { RolePortalsModal } from "./RolePortalsModal";
import { RoleUpsertModal } from "./RoleUpsertModal";
import { TableRoles } from "./TableRoles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const getEmptyRoleForm = () => ({
  cargo: "",
  code: "",
  portalIds: [],
});

export function AdminRolesView() {
  const [roles, setRoles] = useState([]);
  const [portalOptions, setPortalOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState();
  const [rolePortalsLoading, setRolePortalsLoading] = useState(false);
  const [isRolePortalsSubmiting, setIsRolePortalsSubmiting] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState();
  const [roleModalLoading, setRoleModalLoading] = useState(false);
  const [isRoleModalSubmiting, setIsRoleModalSubmiting] = useState(false);
  const [roleModalInitialValue, setRoleModalInitialValue] =
    useState(getEmptyRoleForm);
  const [editingRoleId, setEditingRoleId] = useState();
  const [input, setInput] = useState("");

  const fetchRoles = async () => {
    const data = await getRoles();
    setRoles(data);
  };

  const fetchInitialData = async () => {
    try {
      const [rolesData, portalOptionsData] = await Promise.all([
        getRoles(),
        getRolePortalOptions(),
      ]);

      setRoles(rolesData);
      setPortalOptions(portalOptionsData);
    } catch {
      toast.error("Falha ao buscar roles. Recarregue a pagina.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const resetRoleModal = () => {
    setRoleModalMode(undefined);
    setRoleModalLoading(false);
    setIsRoleModalSubmiting(false);
    setRoleModalInitialValue(getEmptyRoleForm());
    setEditingRoleId(undefined);
  };

  const handleOpenCreateRole = () => {
    if (roleModalLoading || isRoleModalSubmiting) {
      return;
    }

    setEditingRoleId(undefined);
    setRoleModalInitialValue(getEmptyRoleForm());
    setRoleModalLoading(false);
    setRoleModalMode("create");
  };

  const handleOpenEditRole = async (role) => {
    if (roleModalLoading || isRoleModalSubmiting) {
      return;
    }

    try {
      setEditingRoleId(role._id);
      setRoleModalMode("edit");
      setRoleModalInitialValue(getEmptyRoleForm());
      setRoleModalLoading(true);

      const roleData = await getRoleById(role._id);

      setRoleModalInitialValue({
        cargo: roleData.cargo,
        code: roleData.code,
        portalIds: roleData.portals?.map((portal) => portal._id) || [],
      });
    } catch {
      toast.error("Falha ao carregar os detalhes da role.");
      resetRoleModal();
      return;
    }

    setRoleModalLoading(false);
  };

  const handleCloseRoleModal = () => {
    if (roleModalLoading || isRoleModalSubmiting) {
      return;
    }

    resetRoleModal();
  };

  const handleRoleSubmit = async (formData) => {
    const isEditMode = roleModalMode === "edit";

    if (isEditMode && !editingRoleId) {
      return;
    }

    try {
      setIsRoleModalSubmiting(true);

      if (isEditMode) {
        await updateRole(editingRoleId, formData);
      } else {
        await createRole(formData);
      }

      await fetchRoles();
      toast.success(
        isEditMode
          ? "Role alterada com sucesso."
          : "Role cadastrada com sucesso.",
      );
      resetRoleModal();
    } catch (error) {
      toast.error(
        error.message ||
          (isEditMode
            ? "Falha ao alterar role. Tente novamente."
            : "Falha ao cadastrar role. Tente novamente."),
      );
    } finally {
      setIsRoleModalSubmiting(false);
    }
  };

  const handleOpenRole = async (role) => {
    if (rolePortalsLoading || isRolePortalsSubmiting) {
      return;
    }

    try {
      setSelectedRole(role);
      setRolePortalsLoading(true);

      const roleData = await getRoleById(role._id);
      setSelectedRole(roleData);
    } catch {
      toast.error("Falha ao carregar os detalhes da role.");
      setSelectedRole(undefined);
    }

    setRolePortalsLoading(false);
  };

  const handleCloseModal = () => {
    if (rolePortalsLoading || isRolePortalsSubmiting) {
      return;
    }

    setSelectedRole(undefined);
    setRolePortalsLoading(false);
  };

  const handleSubmit = async (payload) => {
    if (!selectedRole?._id) {
      return;
    }

    try {
      setIsRolePortalsSubmiting(true);
      await updateRole(selectedRole._id, payload);
      await fetchRoles();
      toast.success("Permissões da role atualizadas com sucesso.");
      setSelectedRole(undefined);
      setRolePortalsLoading(false);
    } catch (error) {
      toast.error(error.message || "Falha ao atualizar a role.");
    } finally {
      setIsRolePortalsSubmiting(false);
    }
  };

  const filteredRoles = roles.filter((role) => {
    const normalizedSearch = input.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return (
      role.cargo?.toLowerCase().includes(normalizedSearch) ||
      role.code?.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <LayoutPortal>
      <HeaderRow>
        <div>
          <TitleRow>
            <h1 className="mb-0">🛡️ Roles e portais liberados</h1>
            <Button size="sm" className="mt-2" onClick={handleOpenCreateRole}>
              Nova role
            </Button>
          </TitleRow>
          <HelperText>
            Clique em uma role para marcar ou desmarcar os portais que ela pode
            ver.
          </HelperText>
        </div>
        <SearchField>
          <SearchIcon icon={faMagnifyingGlass} />
          <SearchInput
            type="text"
            placeholder="Pesquisar role"
            aria-label="Pesquisar role"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </SearchField>
      </HeaderRow>

      {loading ? (
        <Loading />
      ) : (
        <TableRoles
          roles={filteredRoles}
          onManageRole={handleOpenRole}
          onEditRole={handleOpenEditRole}
          onDeleteRole={fetchRoles}
        />
      )}

      <RoleUpsertModal
        show={Boolean(roleModalMode)}
        mode={roleModalMode}
        initialValue={roleModalInitialValue}
        isLoading={roleModalLoading}
        isSubmiting={isRoleModalSubmiting}
        onHide={handleCloseRoleModal}
        onSubmit={handleRoleSubmit}
      />

      <RolePortalsModal
        show={Boolean(selectedRole)}
        role={selectedRole}
        portals={portalOptions}
        isLoading={rolePortalsLoading}
        isSubmiting={isRolePortalsSubmiting}
        onHide={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </LayoutPortal>
  );
}

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin: 16px 0;
  flex-wrap: wrap;
`;

const HelperText = styled.p`
  margin: 8px 0 0;
  color: #6c757d;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const SearchField = styled.div`
  position: relative;
  width: min(340px, 100%);
  margin-top: 18px;
`;

const SearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  top: 50%;
  left: 16px;
  color: #6c757d;
  font-size: 0.9rem;
  pointer-events: none;
  transform: translateY(-50%);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 9px 16px 9px 42px;
  border: 1px solid #ced4da;
  border-radius: 10px;
  background: #ffffff;
  color: #212529;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;

  &::placeholder {
    color: #6c757d;
  }

  &:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.12);
  }
`;
