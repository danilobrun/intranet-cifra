import { forwardRef, useEffect, useState } from "react";
import { Button, Dropdown, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getRoles } from "../../services/Roles.service";
import { selectUser } from "../../store/User/User.selectors";

const emptyFormData = {
  name: "",
  email: "",
  number: "",
  personalNumber: "",
  function: "",
  state: "",
  lotation: "",
  password: "",
  roleCodes: ["3"],
};

const normalizeFormData = (value = emptyFormData) => ({
  name: String(value.name || ""),
  email: String(value.email || ""),
  number: String(value.number || ""),
  personalNumber: String(value.personalNumber || ""),
  function: String(value.function || ""),
  state: String(value.state || ""),
  lotation: String(value.lotation || ""),
  password: String(value.password || ""),
  roleCodes: Array.isArray(value.roleCodes)
    ? [...value.roleCodes]
    : [...emptyFormData.roleCodes],
});

const getRoleLabel = (role) => {
  const cargo = String(role?.cargo || "").trim();

  return cargo || "Role sem identificacao";
};

const RoleSelectToggle = forwardRef(
  ({ children, onClick, disabled, title, ...props }, ref) => {
    return (
      <button
        {...props}
        ref={ref}
        type="button"
        className="form-select text-start"
        disabled={disabled}
        title={title}
        onClick={(event) => {
          event.preventDefault();

          if (!disabled) {
            onClick(event);
          }
        }}
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </button>
    );
  },
);

RoleSelectToggle.displayName = "RoleSelectToggle";

export function UpdateUserForm({
  initialValue = emptyFormData,
  buttonLabel = "Cadastrar",
  type,
  onSubmit,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState(() =>
    normalizeFormData(initialValue),
  );
  const [roleOptions, setRoleOptions] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const user = useSelector(selectUser);
  const isAdmin = user?.roles?.[0]?.code === "1";

  useEffect(() => {
    setFormData(normalizeFormData(initialValue));
  }, [initialValue]);

  useEffect(() => {
    const fetchRoleOptions = async () => {
      if (!isAdmin) {
        setRoleOptions([]);
        return;
      }

      try {
        setIsLoadingRoles(true);
        const roles = await getRoles();
        setRoleOptions(Array.isArray(roles) ? roles : []);
      } catch (error) {
        toast.error(error.message || "Falha ao carregar roles.");
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoleOptions();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !roleOptions.length) {
      return;
    }

    setFormData((currentFormData) => {
      const roleCodes = Array.isArray(currentFormData.roleCodes)
        ? currentFormData.roleCodes.filter(Boolean)
        : [];
      const availableRoleCodes = new Set(
        roleOptions
          .map((role) => String(role?.code || "").trim())
          .filter(Boolean),
      );
      const validRoleCodes = roleCodes.filter((code) =>
        availableRoleCodes.has(code),
      );

      if (validRoleCodes.length === roleCodes.length && validRoleCodes.length) {
        return currentFormData;
      }

      if (validRoleCodes.length) {
        return {
          ...currentFormData,
          roleCodes: validRoleCodes,
        };
      }

      const defaultRole =
        roleOptions.find((role) => String(role?.code) === "3") ||
        roleOptions[0];

      if (!defaultRole?.code) {
        return currentFormData;
      }

      return {
        ...currentFormData,
        roleCodes: [defaultRole.code],
      };
    });
  }, [isAdmin, roleOptions]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "number" || name === "personalNumber") {
      let cleanedValue = value.replace(/\D/g, "");
      if (cleanedValue.length > 11) {
        cleanedValue = cleanedValue.slice(0, 11);
      }

      let numberFormatted = cleanedValue;

      if (cleanedValue.length > 2) {
        numberFormatted = `(${cleanedValue.slice(0, 2)}) ${cleanedValue.slice(
          2,
          7,
        )}-${cleanedValue.slice(7)}`;
      }

      setFormData((currentFormData) => ({
        ...currentFormData,
        [name]: numberFormatted,
      }));
      return;
    }

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleRoleToggle = (roleCode) => {
    setFormData((currentFormData) => {
      const currentRoleCodes = Array.isArray(currentFormData.roleCodes)
        ? currentFormData.roleCodes
        : [];
      const roleIsSelected = currentRoleCodes.includes(roleCode);

      return {
        ...currentFormData,
        roleCodes: roleIsSelected
          ? currentRoleCodes.filter(
              (currentRoleCode) => currentRoleCode !== roleCode,
            )
          : [...currentRoleCodes, roleCode],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isAdmin && !formData.roleCodes?.length) {
      toast.error("Selecione ao menos uma role.");
      return;
    }

    setIsSubmiting(true);

    try {
      await onSubmit(formData);
    } finally {
      setIsSubmiting(false);
    }
  };

  const isRoleSelectDisabled =
    !isAdmin || isLoadingRoles || roleOptions.length === 0;
  const selectedRoleLabels = roleOptions
    .filter((role) => (formData.roleCodes || []).includes(role.code))
    .map((role) => getRoleLabel(role));
  const selectedRolesText = selectedRoleLabels.length
    ? selectedRoleLabels.join(", ")
    : "Selecione uma ou mais roles";

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="user-name">
        <Form.Label className="mb-0">Nome</Form.Label>
        <Form.Control
          type="text"
          placeholder="Nome do usuario"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="user-email">
        <Form.Label className="mb-0">Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Email do usuario"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="user-number">
        <Form.Label className="mb-0">Telefone Funcional</Form.Label>
        <Form.Control
          type="text"
          placeholder="Telefone funcional do usuario"
          name="number"
          value={formData.number}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="user-personal-number">
        <Form.Label className="mb-0">Telefone Pessoal</Form.Label>
        <Form.Control
          type="text"
          placeholder="Telefone pessoal do usuario"
          name="personalNumber"
          value={formData.personalNumber}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="user-function">
        <Form.Label className="mb-0">Funcao</Form.Label>
        <Form.Control
          type="text"
          placeholder="Funcao do usuario"
          name="function"
          value={formData.function}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="user-state">
        <Form.Label className="mb-0">Estado</Form.Label>
        <Form.Control
          type="text"
          placeholder="Estado do usuario"
          name="state"
          value={formData.state}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="user-lotation">
        <Form.Label className="mb-0">Lotacao</Form.Label>
        <Form.Control
          type="text"
          placeholder="Lotacao do usuario"
          name="lotation"
          value={formData.lotation}
          onChange={handleChange}
        />
      </Form.Group>

      {isAdmin ? (
        <Form.Group className="mb-3" controlId="user-roles">
          <Form.Label className="mb-0">Roles</Form.Label>
          <Dropdown autoClose="outside">
            <Dropdown.Toggle
              as={RoleSelectToggle}
              disabled={isRoleSelectDisabled}
              title={selectedRolesText}
            >
              {selectedRolesText}
            </Dropdown.Toggle>
            <Dropdown.Menu
              className="w-100 p-2"
              style={{ maxHeight: "260px", overflowY: "auto" }}
            >
              {roleOptions.map((role) => (
                <Form.Check
                  key={role._id || role.code}
                  id={`user-role-${role._id || role.code}`}
                  type="checkbox"
                  label={getRoleLabel(role)}
                  checked={(formData.roleCodes || []).includes(role.code)}
                  onChange={() => handleRoleToggle(role.code)}
                  className="mb-2"
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Form.Text muted>
            {isLoadingRoles
              ? "Carregando roles cadastradas..."
              : roleOptions.length
                ? "Selecione uma ou mais roles cadastradas no banco."
                : "Nenhuma role cadastrada foi encontrada."}
          </Form.Text>
        </Form.Group>
      ) : null}

      <Form.Group className="mb-3" controlId="user-password">
        <Form.Label className="mb-0">Senha</Form.Label>
        <Form.Control
          type="password"
          placeholder="Insira a senha"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required={type === "create"}
        />
      </Form.Group>

      <Button
        type="submit"
        disabled={
          isSubmiting || (isAdmin && (isLoadingRoles || !roleOptions.length))
        }
      >
        {buttonLabel}
      </Button>
    </Form>
  );
}
