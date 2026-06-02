import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faImage,
  faLink,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const emptyDetail = {
  url: "",
  baseLink: "",
  updateSchedule: "",
  nameForm: "",
  emailResponsible: "",
};

const emptyFormData = {
  name: "",
  responsible: "",
  shortDescription: "",
  description: "",
  emailResponsible: "",
  image: "",
  url: "",
  details: [{ ...emptyDetail }],
};

const normalizeFormData = (value = emptyFormData) => ({
  ...emptyFormData,
  ...value,
  details: value.details?.length ? value.details : [{ ...emptyDetail }],
});

export function UpsertPortalForm({
  initialValue = emptyFormData,
  buttonLabel = "Cadastrar",
  onSubmit,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState(() =>
    normalizeFormData(initialValue),
  );

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmiting(true);

    try {
      await onSubmit(formData);
    } finally {
      setIsSubmiting(false);
    }
  };

  const handleDetailChange = (index, event) => {
    const newDetails = [...formData.details];
    newDetails[index] = {
      ...newDetails[index],
      [event.target.name]: event.target.value,
    };
    setFormData({ ...formData, details: newDetails });
  };

  const handleAddDetails = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { ...emptyDetail }],
    });
  };

  const handleRemoveDetails = (index) => {
    const newDetails = [...formData.details];
    newDetails.splice(index, 1);
    setFormData({ ...formData, details: newDetails });
  };

  return (
    <PortalForm onSubmit={handleSubmit}>
      <FormSection $imageAccess>
        <SectionHeader>
          <SectionTitle>Informações do portal</SectionTitle>
          <SectionDescription>
            Dados principais exibidos na listagem e no detalhe do portal.
          </SectionDescription>
        </SectionHeader>

        <FieldsGrid>
          <FieldGroup controlId="portal-name">
            <FieldLabel>Nome do portal</FieldLabel>
            <FieldControl
              placeholder="Ex.: Portal de contratos"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          <FieldGroup controlId="portal-responsible">
            <FieldLabel>Responsável</FieldLabel>
            <FieldControl
              placeholder="Nome do responsável"
              name="responsible"
              value={formData.responsible}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          <FieldGroup controlId="portal-emailResponsible">
            <FieldLabel>E-mail responsável</FieldLabel>
            <FieldControl
              type="email"
              placeholder="responsavel@cifraengenharia.com.br"
              name="emailResponsible"
              value={formData.emailResponsible}
              onChange={handleChange}
            />
          </FieldGroup>

          <FieldGroup controlId="portal-url">
            <FieldLabel>Link principal</FieldLabel>
            <FieldControl
              placeholder="https://"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          <FieldGroup $full controlId="portal-short-description">
            <FieldLabel>Descrição curta</FieldLabel>
            <FieldControl
              as="textarea"
              $multiline
              placeholder="Texto que aparece na listagem do portal"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          <FieldGroup $full controlId="portal-description">
            <FieldLabel>Descrição longa</FieldLabel>
            <FieldControl
              as="textarea"
              $multiline
              placeholder="Texto que aparece no detalhe do portal"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </FieldGroup>
        </FieldsGrid>
      </FormSection>

      <FormSection>
        <SectionHeader>
          <SectionTitle>Imagem e acesso</SectionTitle>
          <SectionDescription>
            Use o link direto da imagem que será exibida no card do portal.
          </SectionDescription>
        </SectionHeader>

        <ImageAccessGrid>
          <FieldGroup controlId="portal-image">
            <FieldLabel>URL da imagem</FieldLabel>
            <FieldControl
              placeholder="Cole o link direto da imagem"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
            />
            <FieldHint>
              <FontAwesomeIcon icon={faCircleInfo} />
              Hospede a foto no{" "}
              <a href="https://postimages.org/" target="_blank" rel="noreferrer">
                postimages
              </a>{" "}
              e cole o link direto aqui.
            </FieldHint>
          </FieldGroup>

          <PreviewColumn>
            <ImagePreviewBox>
              {formData.image ? (
                <PreviewImage src={formData.image} alt="Pré-visualização" />
              ) : (
                <PreviewPlaceholder>
                  <FontAwesomeIcon icon={faImage} />
                  <span>Pré-visualização</span>
                </PreviewPlaceholder>
              )}
            </ImagePreviewBox>
          </PreviewColumn>
        </ImageAccessGrid>
      </FormSection>

      <FormSection>
        <DetailsHeader>
          <div>
            <SectionTitle>Links e horários</SectionTitle>
            <SectionDescription>
              Cadastre os links que aparecerão na tabela de detalhes do portal.
            </SectionDescription>
          </div>

          <AddDetailButton
            type="button"
            variant="primary"
            onClick={handleAddDetails}
          >
            <FontAwesomeIcon icon={faPlus} />
            Adicionar link
          </AddDetailButton>
        </DetailsHeader>

        <DetailsTableScroll>
          <DetailsTable>
            <thead>
              <tr>
                <th>Nome</th>
                <th>URL de acesso</th>
                <th>URL da base</th>
                <th>Atualização</th>
                <th>E-mail responsável</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {formData.details.map((detail, index) => (
                <tr key={index}>
                  <td>
                    <TableField
                      aria-label={`Nome do link ${index + 1}`}
                      placeholder="Nome"
                      name="nameForm"
                      value={detail.nameForm}
                      onChange={(event) => handleDetailChange(index, event)}
                    />
                  </td>
                  <td>
                    <TableField
                      aria-label={`URL de acesso do link ${index + 1}`}
                      placeholder="https://"
                      name="url"
                      value={detail.url}
                      onChange={(event) => handleDetailChange(index, event)}
                    />
                  </td>
                  <td>
                    <TableField
                      aria-label={`URL da base do link ${index + 1}`}
                      placeholder="https://"
                      name="baseLink"
                      value={detail.baseLink}
                      onChange={(event) => handleDetailChange(index, event)}
                    />
                  </td>
                  <td>
                    <TableField
                      aria-label={`Atualização do link ${index + 1}`}
                      placeholder="Ex.: 08h e 14h"
                      name="updateSchedule"
                      value={detail.updateSchedule}
                      onChange={(event) => handleDetailChange(index, event)}
                    />
                  </td>
                  <td>
                    <TableField
                      aria-label={`E-mail responsável do link ${index + 1}`}
                      placeholder="email@cifra..."
                      name="emailResponsible"
                      value={detail.emailResponsible}
                      onChange={(event) => handleDetailChange(index, event)}
                    />
                  </td>
                  <td>
                    <RemoveDetailButton
                      type="button"
                      variant="light"
                      disabled={formData.details.length === 1}
                      onClick={() => handleRemoveDetails(index)}
                      aria-label={`Remover link ${index + 1}`}
                      title={
                        formData.details.length === 1
                          ? "Mantenha ao menos uma linha"
                          : "Remover link"
                      }
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </RemoveDetailButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </DetailsTable>
        </DetailsTableScroll>
      </FormSection>

      <ActionsBar>
        <SecondaryAction forwardedAs={Link} to="/portal/portals" variant="light">
          Cancelar
        </SecondaryAction>
        <PrimaryAction type="submit" disabled={isSubmiting}>
          <FontAwesomeIcon icon={faLink} />
          {isSubmiting ? "Salvando..." : buttonLabel}
        </PrimaryAction>
      </ActionsBar>
    </PortalForm>
  );
}

const PortalForm = styled(Form)`
  display: grid;
  gap: 22px;
  padding-bottom: 32px;
`;

const FormSection = styled.section`
  padding: 22px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 12px;
  background: oklch(99% 0.004 245);
  box-shadow: 0 10px 24px oklch(22% 0.018 245 / 0.06);

  ${({ $imageAccess }) =>
    $imageAccess
      ? `
        min-height: 360px;
        display: flex;
        flex-direction: column;
      `
      : ""}

  @media (max-width: 575.98px) {
    padding: 18px;
    border-radius: 10px;

    ${({ $imageAccess }) => ($imageAccess ? "min-height: auto;" : "")}
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: 1.08rem;
  font-weight: 760;
  line-height: 1.25;
`;

const SectionDescription = styled.p`
  margin: 6px 0 0;
  color: oklch(49% 0.018 245);
  font-size: 0.93rem;
  line-height: 1.45;
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const FieldGroup = styled(Form.Group)`
  display: grid;
  gap: 8px;
  grid-column: ${({ $full }) => ($full ? "1 / -1" : "auto")};
`;

const FieldLabel = styled(Form.Label)`
  margin: 0;
  color: oklch(28% 0.016 245);
  font-size: 0.92rem;
  font-weight: 700;
`;

const FieldControl = styled(Form.Control)`
  min-height: ${({ $multiline }) => ($multiline ? "92px" : "50px")};
  padding: ${({ $multiline }) => ($multiline ? "13px 14px" : "0 14px")};
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 10px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
  font-size: 0.98rem;
  line-height: 1.45;
  box-shadow: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;

  &::placeholder {
    color: oklch(58% 0.018 245);
  }

  &:focus {
    border-color: oklch(55% 0.17 253);
    background-color: oklch(99.2% 0.004 240);
    box-shadow: 0 0 0 0.22rem oklch(55% 0.17 253 / 0.14);
  }
`;

const FieldHint = styled(Form.Text)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: oklch(48% 0.018 245);
  font-size: 0.86rem;

  a {
    color: oklch(48% 0.16 253);
    font-weight: 650;
    text-decoration: none;

    &:hover,
    &:focus {
      text-decoration: underline;
    }
  }
`;

const ImageAccessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(28px, 4vw, 56px);
  align-items: center;
  flex: 1;

  ${FieldGroup} {
    width: min(100%, 720px);
  }

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const PreviewColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  justify-self: center;
  width: 100%;
`;

const ImagePreviewBox = styled.div`
  display: grid;
  place-items: center;
  width: min(100%, 360px);
  height: clamp(260px, 20vw, 320px);
  padding: 18px;
  overflow: hidden;
  border: 1px dashed oklch(82% 0.018 245);
  border-radius: 12px;
  background:
    linear-gradient(135deg, oklch(98% 0.006 245), oklch(96% 0.008 245));
`;

const PreviewImage = styled.img`
  box-sizing: border-box;
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const PreviewPlaceholder = styled.div`
  display: grid;
  justify-items: center;
  gap: 8px;
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  font-weight: 650;

  svg {
    font-size: 1.45rem;
    color: oklch(56% 0.018 245);
  }
`;

const DetailsHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
`;

const AddDetailButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  border: 0;
  border-radius: 8px;
  font-weight: 700;
`;

const DetailsTableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
`;

const DetailsTable = styled.table`
  width: 100%;
  min-width: 1120px;
  border-collapse: separate;
  border-spacing: 0;

  th {
    padding: 0.78rem 0.75rem;
    border-bottom: 1px solid oklch(88% 0.01 245);
    background: linear-gradient(
      180deg,
      oklch(58% 0.018 245) 0%,
      oklch(52% 0.018 245) 100%
    );
    color: oklch(98% 0.004 240);
    font-size: 0.82rem;
    font-weight: 760;
    white-space: nowrap;
  }

  td {
    padding: 0.75rem;
    border-bottom: 1px solid oklch(92% 0.006 245);
    background: oklch(99% 0.004 245);
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }
`;

const TableField = styled.input`
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 8px;
  background: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;

  &::placeholder {
    color: oklch(58% 0.018 245);
  }

  &:focus {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.18rem oklch(55% 0.17 253 / 0.12);
  }
`;

const RemoveDetailButton = styled(Button)`
  display: inline-grid;
  place-items: center;
  width: 38px;
  min-width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid oklch(89% 0.016 25);
  border-radius: 8px;
  color: oklch(49% 0.18 25);
  background: oklch(98% 0.01 25);

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    border-color: oklch(80% 0.05 25);
    color: oklch(42% 0.18 25);
    background: oklch(96% 0.018 25);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

const ActionsBar = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 2;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 0;
  background: linear-gradient(
    180deg,
    oklch(98.5% 0.004 245 / 0),
    oklch(98.5% 0.004 245) 38%
  );

  @media (max-width: 575.98px) {
    flex-direction: column-reverse;
  }
`;

const SecondaryAction = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 20px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 10px;
  color: oklch(31% 0.018 245);
  background: oklch(99% 0.004 245);
  font-weight: 700;
  text-decoration: none;

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    text-decoration: none;
  }
`;

const PrimaryAction = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 22px;
  border: 0;
  border-radius: 10px;
  background-color: oklch(54% 0.19 253);
  color: oklch(98% 0.004 240);
  font-weight: 760;

  &:hover,
  &:focus {
    background-color: oklch(48% 0.2 253);
    box-shadow: 0 12px 24px oklch(42% 0.18 253 / 0.24);
  }

  &:disabled {
    background-color: oklch(68% 0.06 250);
    box-shadow: none;
  }
`;
