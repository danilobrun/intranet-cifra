import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { RolePortalSelector } from "./RolePortalSelector";
import {
  ActionsBar,
  FieldControl,
  FieldGroup,
  FieldLabel,
  FieldsGrid,
  FormSection,
  PrimaryAction,
  RoleForm,
  SecondaryAction,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "./styles";

const emptyFormData = {
  cargo: "",
  code: "",
  portalIds: [],
};

const normalizeFormData = (value = emptyFormData) => ({
  cargo: String(value.cargo || ""),
  code: String(value.code || ""),
  portalIds: Array.isArray(value.portalIds) ? [...value.portalIds] : [],
});

export function UpsertRoleForm({
  initialValue = emptyFormData,
  portalOptions = [],
  buttonLabel = "Cadastrar role",
  onSubmit,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState(() =>
    normalizeFormData(initialValue),
  );

  useEffect(() => {
    setFormData(normalizeFormData(initialValue));
  }, [initialValue]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handlePortalIdsChange = (portalIds) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      portalIds,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmiting(true);

    try {
      await onSubmit({
        cargo: String(formData.cargo || "").trim(),
        code: String(formData.code || "").trim(),
        portalIds: Array.isArray(formData.portalIds) ? formData.portalIds : [],
      });
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <RoleForm onSubmit={handleSubmit}>
      <FormSection>
        <SectionHeader>
          <SectionTitle>Dados da role</SectionTitle>
          <SectionDescription>
            Identificação usada para controlar permissões de acesso no sistema.
          </SectionDescription>
        </SectionHeader>

        <FieldsGrid>
          <FieldGroup controlId="role-cargo">
            <FieldLabel>Cargo / nome da role</FieldLabel>
            <FieldControl
              type="text"
              placeholder="Ex.: Funcionário"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          <FieldGroup $compact controlId="role-code">
            <FieldLabel>Code</FieldLabel>
            <FieldControl
              type="text"
              placeholder="Ex.: 3"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
            />
          </FieldGroup>
        </FieldsGrid>
      </FormSection>

      <FormSection>
        <SectionHeader>
          <SectionTitle>Portais liberados</SectionTitle>
          <SectionDescription>
            Defina quais portais usuários com esta role poderão acessar.
          </SectionDescription>
        </SectionHeader>

        <RolePortalSelector
          portals={portalOptions}
          selectedPortalIds={formData.portalIds}
          onChange={handlePortalIdsChange}
        />
      </FormSection>

      <ActionsBar>
        <SecondaryAction forwardedAs={Link} to="/portal/roles" variant="light">
          Cancelar
        </SecondaryAction>
        <PrimaryAction type="submit" disabled={isSubmiting}>
          <FontAwesomeIcon icon={faShieldHalved} />
          {isSubmiting ? "Salvando..." : buttonLabel}
        </PrimaryAction>
      </ActionsBar>
    </RoleForm>
  );
}
