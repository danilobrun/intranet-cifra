import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { getRoles } from "../../services/Roles.service";
import { selectUser } from "../../store/User/User.selectors";
import { ProfileAvatarCard } from "./ProfileAvatarCard";
import { RoleChipsSelect } from "./RoleChipsSelect";
import {
  ActionsBar,
  FieldControl,
  FieldGroup,
  FieldHint,
  FieldLabel,
  FieldsGrid,
  FormSection,
  PasswordField,
  PasswordToggle,
  PrimaryAction,
  SecondaryAction,
  SectionDescription,
  SectionHeader,
  SectionTitle,
  UserForm,
} from "./styles";

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

const getCpfDigits = (value = "") => String(value || "").replace(/\D/g, "");

export function UpdateUserForm({
  avatarConfig,
  initialValue = emptyFormData,
  buttonLabel = "Cadastrar",
  type,
  onSubmit,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarDraftCpf, setAvatarDraftCpf] = useState("");
  const [avatarCpfToSave, setAvatarCpfToSave] = useState("");
  const [isAvatarPreviewLoading, setIsAvatarPreviewLoading] = useState(false);
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

    const avatarDraftCpfDigits = getCpfDigits(avatarDraftCpf);

    if (avatarConfig && avatarDraftCpfDigits && !avatarCpfToSave) {
      toast.error("Busque e valide a foto antes de salvar o formulario.");
      return;
    }

    if (isAdmin && !formData.roleCodes?.length) {
      toast.error("Selecione ao menos uma role.");
      return;
    }

    setIsSubmiting(true);

    try {
      await onSubmit(formData, avatarCpfToSave || null);
    } finally {
      setIsSubmiting(false);
    }
  };

  const isRoleSelectDisabled =
    !isAdmin || isLoadingRoles || roleOptions.length === 0;
  const submitIsDisabled =
    isSubmiting ||
    isAvatarPreviewLoading ||
    (isAdmin && (isLoadingRoles || !roleOptions.length));

  return (
    <UserForm onSubmit={handleSubmit}>
      {avatarConfig ? (
        <ProfileAvatarCard
          avatarConfig={avatarConfig}
          userName={formData.name}
          onDraftCpfChange={setAvatarDraftCpf}
          onPreviewLoadingChange={setIsAvatarPreviewLoading}
          onValidatedCpfChange={setAvatarCpfToSave}
        />
      ) : null}

      <FormSection>
        <SectionHeader>
          <SectionTitle>Dados do usuário</SectionTitle>
          <SectionDescription>
            Informações básicas usadas para identificar o colaborador na
            intranet.
          </SectionDescription>
        </SectionHeader>

        <FieldsGrid>
          <FieldGroup controlId="user-name">
            <FieldLabel>Nome completo</FieldLabel>
            <FieldControl
              type="text"
              placeholder="Nome do usuário"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </FieldGroup>

          <FieldGroup controlId="user-email">
            <FieldLabel>E-mail corporativo</FieldLabel>
            <FieldControl
              type="email"
              placeholder="seunome@cifraengenharia.com.br"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </FieldGroup>
        </FieldsGrid>
      </FormSection>

      <FormSection>
        <SectionHeader>
          <SectionTitle>Contato</SectionTitle>
          <SectionDescription>
            Telefones usados para consulta interna e comunicação operacional.
          </SectionDescription>
        </SectionHeader>

        <FieldsGrid>
          <FieldGroup controlId="user-number">
            <FieldLabel>Telefone funcional</FieldLabel>
            <FieldControl
              type="text"
              placeholder="Telefone funcional do usuário"
              name="number"
              value={formData.number}
              onChange={handleChange}
              autoComplete="tel"
            />
          </FieldGroup>

          <FieldGroup controlId="user-personal-number">
            <FieldLabel>Telefone pessoal</FieldLabel>
            <FieldControl
              type="text"
              placeholder="Telefone pessoal do usuário"
              name="personalNumber"
              value={formData.personalNumber}
              onChange={handleChange}
              autoComplete="tel"
            />
          </FieldGroup>
        </FieldsGrid>
      </FormSection>

      <FormSection>
        <SectionHeader>
          <SectionTitle>Dados profissionais</SectionTitle>
          <SectionDescription>
            Dados usados para organizar colaboradores por função, estado e
            lotação.
          </SectionDescription>
        </SectionHeader>

        <FieldsGrid>
          <FieldGroup $full controlId="user-function">
            <FieldLabel>Função</FieldLabel>
            <FieldControl
              type="text"
              placeholder="Função do usuário"
              name="function"
              value={formData.function}
              onChange={handleChange}
            />
          </FieldGroup>

          <FieldGroup controlId="user-state">
            <FieldLabel>Estado</FieldLabel>
            <FieldControl
              type="text"
              placeholder="Estado do usuário"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </FieldGroup>

          <FieldGroup controlId="user-lotation">
            <FieldLabel>Lotação</FieldLabel>
            <FieldControl
              type="text"
              placeholder="Lotação do usuário"
              name="lotation"
              value={formData.lotation}
              onChange={handleChange}
            />
          </FieldGroup>
        </FieldsGrid>
      </FormSection>

      {isAdmin ? (
        <FormSection>
          <SectionHeader>
            <SectionTitle>Permissões</SectionTitle>
            <SectionDescription>
              Defina quais áreas e portais este usuário poderá acessar.
            </SectionDescription>
          </SectionHeader>

          <FieldGroup controlId="user-roles">
            <FieldLabel>Roles</FieldLabel>
            <RoleChipsSelect
              disabled={isRoleSelectDisabled}
              isLoading={isLoadingRoles}
              roleOptions={roleOptions}
              selectedRoleCodes={formData.roleCodes || []}
              onToggleRole={handleRoleToggle}
            />
            <FieldHint>
              {isLoadingRoles
                ? "Carregando roles cadastradas..."
                : roleOptions.length
                  ? "Selecione uma ou mais roles cadastradas no banco."
                  : "Nenhuma role cadastrada foi encontrada."}
            </FieldHint>
          </FieldGroup>
        </FormSection>
      ) : null}

      <FormSection>
        <SectionHeader>
          <SectionTitle>Acesso</SectionTitle>
          <SectionDescription>
            Defina a senha inicial do usuário. Ela poderá ser alterada depois.
          </SectionDescription>
        </SectionHeader>

        <FieldGroup controlId="user-password">
          <FieldLabel>Senha inicial</FieldLabel>
          <PasswordField>
            <FieldControl
              type={showPassword ? "text" : "password"}
              placeholder={
                type === "create" ? "Insira a senha" : "Deixe em branco para manter"
              }
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={type === "create"}
              autoComplete="new-password"
            />
            <PasswordToggle
              type="button"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setShowPassword((currentValue) => !currentValue)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </PasswordToggle>
          </PasswordField>
        </FieldGroup>
      </FormSection>

      <ActionsBar>
        <SecondaryAction forwardedAs={Link} to="/portal/users" variant="light">
          Cancelar
        </SecondaryAction>
        <PrimaryAction type="submit" disabled={submitIsDisabled}>
          <FontAwesomeIcon icon={faUserPlus} />
          {isSubmiting ? "Salvando..." : buttonLabel}
        </PrimaryAction>
      </ActionsBar>
    </UserForm>
  );
}
