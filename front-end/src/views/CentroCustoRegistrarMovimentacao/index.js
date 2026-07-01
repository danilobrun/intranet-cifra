import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCircleNotch,
  faClockRotateLeft,
  faMagnifyingGlass,
  faUserCheck,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { toast } from "react-toastify";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import { getFuncionarios } from "../../services/Funcionarios.service";
import { criarMovimentacao } from "../../services/CentroCustoMovimentacoes.service";
import { MeusRegistrosDrawer } from "./MeusRegistrosDrawer";

const SEARCH_LIMIT = 8;

const emptyFormData = {
  novoCentroCusto: "",
  dataAlteracao: "",
  observacao: "",
};

const getTodayInputDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatCpf = (value = "") => {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length !== 11) {
    return value || "-";
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9,
  )}-${digits.slice(9)}`;
};

const normalizeComparableText = (value = "") =>
  String(value || "")
    .trim()
    .toLocaleLowerCase("pt-BR");

export function CentroCustoRegistrarMovimentacaoView() {
  const [search, setSearch] = useState("");
  const [funcionarios, setFuncionarios] = useState([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState();
  const [formData, setFormData] = useState({
    ...emptyFormData,
    dataAlteracao: getTodayInputDate(),
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [meusRegistrosOpen, setMeusRegistrosOpen] = useState(false);

  const normalizedSearch = search.trim();
  const shouldSearch = normalizedSearch.length >= 2;
  const selectedCentroCusto = selectedFuncionario?.centroCusto || "";
  const sameCentroCusto = useMemo(() => {
    if (!selectedCentroCusto || !formData.novoCentroCusto) {
      return false;
    }

    return (
      normalizeComparableText(selectedCentroCusto) ===
      normalizeComparableText(formData.novoCentroCusto)
    );
  }, [formData.novoCentroCusto, selectedCentroCusto]);

  useEffect(() => {
    if (!shouldSearch) {
      setFuncionarios([]);
      setSearchError("");
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError("");

        const data = await getFuncionarios({
          search: normalizedSearch,
          status: "Ativo",
          page: 1,
          limit: SEARCH_LIMIT,
        });

        setFuncionarios(
          Array.isArray(data?.funcionarios) ? data.funcionarios : [],
        );
      } catch (error) {
        setFuncionarios([]);
        setSearchError(
          error.message || "Não foi possível buscar funcionários ativos.",
        );
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [normalizedSearch, shouldSearch]);

  const handleSelectFuncionario = (funcionario) => {
    setSelectedFuncionario(funcionario);
    setFormError("");
    setSuccessMessage("");
  };

  const handleClearSelection = () => {
    setSelectedFuncionario(undefined);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
    setFormError("");
    setSuccessMessage("");
  };

  const resetFormAfterSuccess = () => {
    setSearch("");
    setFuncionarios([]);
    setSelectedFuncionario(undefined);
    setFormData({
      ...emptyFormData,
      dataAlteracao: getTodayInputDate(),
    });
  };

  const validateForm = () => {
    if (!selectedFuncionario?._id) {
      return "Selecione um funcionário ativo antes de salvar.";
    }

    if (!formData.novoCentroCusto.trim()) {
      return "Informe o novo centro de custo.";
    }

    if (!formData.dataAlteracao) {
      return "Informe a data da alteração.";
    }

    if (sameCentroCusto) {
      return "O novo centro de custo deve ser diferente do centro de custo atual.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationMessage = validateForm();

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      await criarMovimentacao({
        funcionarioId: selectedFuncionario._id,
        novoCentroCusto: formData.novoCentroCusto.trim(),
        dataAlteracao: formData.dataAlteracao,
        observacao: formData.observacao.trim(),
      });

      const message = "Movimentação registrada com sucesso e encaminhada ao RH.";

      toast.success(message);
      setSuccessMessage(message);
      resetFormAfterSuccess();
    } catch (error) {
      setFormError(
        error.message ||
          "Não foi possível registrar a movimentação. Verifique os dados e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LayoutPortal>
      <PortalHeader
        title="Registrar Movimentação"
        description="Registre alterações de centro de custo para acompanhamento do RH."
      >
        <HeaderSecondaryButton
          type="button"
          onClick={() => setMeusRegistrosOpen(true)}
        >
          <FontAwesomeIcon icon={faClockRotateLeft} />
          Meus Registros
        </HeaderSecondaryButton>
      </PortalHeader>

      <PageGrid>
        <SearchPanel>
          <PanelHeader>
            <PanelTitle>Funcionário</PanelTitle>
            <PanelHint>Busque por nome ou CPF.</PanelHint>
          </PanelHeader>

          <SearchField>
            <SearchIcon icon={faMagnifyingGlass} />
            <SearchInput
              type="text"
              value={search}
              placeholder="Digite ao menos 2 caracteres"
              aria-label="Buscar funcionário ativo por nome ou CPF"
              onChange={(event) => {
                setSearch(event.target.value);
                setSelectedFuncionario(undefined);
                setSuccessMessage("");
              }}
            />
          </SearchField>

          {searchError ? <Alert variant="danger">{searchError}</Alert> : null}

          <ResultsList aria-busy={isSearching}>
            {!shouldSearch ? (
              <EmptyState>
                Digite nome ou CPF para buscar funcionários ativos.
              </EmptyState>
            ) : isSearching ? (
              <EmptyState>
                <FontAwesomeIcon icon={faCircleNotch} spin />
                Buscando funcionários...
              </EmptyState>
            ) : funcionarios.length ? (
              funcionarios.map((funcionario) => {
                const isSelected = selectedFuncionario?._id === funcionario._id;

                return (
                  <ResultButton
                    key={funcionario._id}
                    type="button"
                    $selected={isSelected}
                    onClick={() => handleSelectFuncionario(funcionario)}
                  >
                    <ResultMain>
                      <ResultName>{funcionario.nome}</ResultName>
                      <ResultMeta>{formatCpf(funcionario.cpf)}</ResultMeta>
                    </ResultMain>
                    <ResultCostCenter>
                      {funcionario.centroCusto}
                    </ResultCostCenter>
                  </ResultButton>
                );
              })
            ) : (
              <EmptyState>Nenhum funcionário ativo encontrado.</EmptyState>
            )}
          </ResultsList>
        </SearchPanel>

        <FormPanel as="form" onSubmit={handleSubmit}>
          <PanelHeader>
            <PanelTitle>Movimentação</PanelTitle>
            <PanelHint>
              Os dados do funcionário são preenchidos automaticamente.
            </PanelHint>
          </PanelHeader>

          {successMessage ? (
            <Alert variant="success">{successMessage}</Alert>
          ) : null}
          {formError ? <Alert variant="danger">{formError}</Alert> : null}
          {sameCentroCusto ? (
            <Alert variant="warning">
              O novo centro de custo deve ser diferente do centro de custo
              atual.
            </Alert>
          ) : null}

          <SelectedFuncionarioBox $empty={!selectedFuncionario}>
            {selectedFuncionario ? (
              <>
                <SelectedHeader>
                  <FontAwesomeIcon icon={faUserCheck} />
                  Funcionário selecionado
                  <ClearSelectionButton
                    type="button"
                    onClick={handleClearSelection}
                  >
                    Trocar
                  </ClearSelectionButton>
                </SelectedHeader>
                <SelectedGrid>
                  <SelectedItem>
                    <SelectedLabel>Nome</SelectedLabel>
                    <SelectedValue>{selectedFuncionario.nome}</SelectedValue>
                  </SelectedItem>
                  <SelectedItem>
                    <SelectedLabel>CPF</SelectedLabel>
                    <SelectedValue>
                      {formatCpf(selectedFuncionario.cpf)}
                    </SelectedValue>
                  </SelectedItem>
                  <SelectedItem>
                    <SelectedLabel>Centro de custo atual</SelectedLabel>
                    <SelectedValue>
                      {selectedFuncionario.centroCusto}
                    </SelectedValue>
                  </SelectedItem>
                </SelectedGrid>
              </>
            ) : (
              <EmptySelection>
                Selecione um funcionário ativo na busca.
              </EmptySelection>
            )}
          </SelectedFuncionarioBox>

          <FieldsGrid>
            <FieldGroup controlId="novo-centro-custo">
              <FieldLabel>Novo centro de custo</FieldLabel>
              <FieldControl
                type="text"
                name="novoCentroCusto"
                value={formData.novoCentroCusto}
                placeholder="Ex.: OBRA-002"
                disabled={isSubmitting}
                onChange={handleFormChange}
                required
              />
            </FieldGroup>

            <FieldGroup controlId="data-alteracao">
              <FieldLabel>Data da alteração</FieldLabel>
              <FieldControl
                type="date"
                name="dataAlteracao"
                value={formData.dataAlteracao}
                disabled={isSubmitting}
                onChange={handleFormChange}
                required
              />
            </FieldGroup>

            <FieldGroup controlId="observacao">
              <FieldLabel>Observação</FieldLabel>
              <ObservationControl
                as="textarea"
                name="observacao"
                rows={4}
                value={formData.observacao}
                placeholder="Descreva o motivo ou contexto da alteração"
                disabled={isSubmitting}
                onChange={handleFormChange}
              />
            </FieldGroup>
          </FieldsGrid>

          <ActionsRow>
            <SubmitButton
              type="submit"
              disabled={isSubmitting || sameCentroCusto}
            >
              <FontAwesomeIcon
                icon={isSubmitting ? faCircleNotch : faCheck}
                spin={isSubmitting}
              />
              {isSubmitting ? "Salvando..." : "Salvar Movimentação"}
            </SubmitButton>
          </ActionsRow>
        </FormPanel>
      </PageGrid>

      <MeusRegistrosDrawer
        show={meusRegistrosOpen}
        onHide={() => setMeusRegistrosOpen(false)}
      />
    </LayoutPortal>
  );
}

const HeaderSecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 9px 16px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    outline: none;
  }

  &:focus-visible {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.14);
  }

  @media (max-width: 767.98px) {
    flex: 1 1 150px;
  }
`;

const PageGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(360px, 1.1fr);
  gap: 18px;
  margin-top: 18px;

  @media (max-width: 991.98px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 18px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
`;

const SearchPanel = styled(Panel)``;

const FormPanel = styled(Panel)``;

const PanelHeader = styled.div`
  display: grid;
  gap: 4px;
`;

const PanelTitle = styled.h2`
  margin: 0;
  color: oklch(28% 0.016 245);
  font-size: 1rem;
  font-weight: 760;
`;

const PanelHint = styled.p`
  margin: 0;
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  line-height: 1.45;
`;

const SearchField = styled.div`
  position: relative;
  min-width: 0;
`;

const SearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  top: 50%;
  left: 14px;
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  pointer-events: none;
  transform: translateY(-50%);
`;

const controlStyles = `
  width: 100%;
  min-height: 42px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 8px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;

  &:focus {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.12);
  }

  &:disabled {
    background-color: oklch(94% 0.006 240);
    color: oklch(52% 0.014 245);
  }
`;

const SearchInput = styled.input`
  ${controlStyles}
  padding: 9px 14px 9px 38px;

  &::placeholder {
    color: oklch(52% 0.018 245);
  }
`;

const ResultsList = styled.div`
  display: grid;
  gap: 8px;
`;

const ResultButton = styled.button`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 12px;
  border: 1px solid
    ${({ $selected }) =>
      $selected ? "oklch(72% 0.09 253)" : "oklch(89% 0.009 245)"};
  border-radius: 8px;
  background: ${({ $selected }) =>
    $selected ? "oklch(97% 0.014 253)" : "oklch(99% 0.004 245)"};
  color: oklch(28% 0.016 245);
  text-align: left;

  &:hover,
  &:focus {
    border-color: oklch(72% 0.09 253);
    background: oklch(97% 0.014 253);
  }

  @media (max-width: 575.98px) {
    grid-template-columns: 1fr;
  }
`;

const ResultMain = styled.span`
  display: grid;
  min-width: 0;
  gap: 3px;
`;

const ResultName = styled.strong`
  color: oklch(24% 0.018 245);
  font-size: 0.94rem;
  font-weight: 760;
  overflow-wrap: break-word;
`;

const ResultMeta = styled.span`
  color: oklch(49% 0.018 245);
  font-size: 0.84rem;
  font-weight: 650;
`;

const ResultCostCenter = styled.span`
  justify-self: end;
  color: oklch(36% 0.018 245);
  font-size: 0.84rem;
  font-weight: 760;
  overflow-wrap: break-word;

  @media (max-width: 575.98px) {
    justify-self: start;
  }
`;

const EmptyState = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 58px;
  padding: 14px;
  border: 1px dashed oklch(86% 0.012 245);
  border-radius: 8px;
  background: oklch(98% 0.004 245);
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  font-weight: 650;
`;

const SelectedFuncionarioBox = styled.div`
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid
    ${({ $empty }) => ($empty ? "oklch(89% 0.009 245)" : "oklch(83% 0.04 253)")};
  border-radius: 8px;
  background: ${({ $empty }) =>
    $empty ? "oklch(98% 0.004 245)" : "oklch(97% 0.014 253)"};
`;

const SelectedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: oklch(30% 0.06 253);
  font-size: 0.9rem;
  font-weight: 780;
`;

const ClearSelectionButton = styled.button`
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid oklch(78% 0.05 253);
  border-radius: 7px;
  background: oklch(99% 0.004 245);
  color: oklch(34% 0.09 253);
  font-size: 0.78rem;
  font-weight: 760;

  &:hover,
  &:focus {
    background: oklch(95% 0.018 253);
  }
`;

const SelectedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const SelectedItem = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

const SelectedLabel = styled.span`
  color: oklch(49% 0.018 245);
  font-size: 0.74rem;
  font-weight: 760;
  text-transform: uppercase;
`;

const SelectedValue = styled.strong`
  color: oklch(24% 0.018 245);
  font-size: 0.92rem;
  font-weight: 760;
  overflow-wrap: break-word;
`;

const EmptySelection = styled.span`
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  font-weight: 650;
`;

const FieldsGrid = styled.div`
  display: grid;
  gap: 14px;
`;

const FieldGroup = styled(Form.Group)`
  display: grid;
  gap: 7px;
`;

const FieldLabel = styled(Form.Label)`
  margin: 0;
  color: oklch(31% 0.018 245);
  font-size: 0.88rem;
  font-weight: 700;
`;

const FieldControl = styled(Form.Control)`
  ${controlStyles}
  padding: 9px 12px;
`;

const ObservationControl = styled(FieldControl)`
  min-height: 116px;
  resize: vertical;
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const SubmitButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border: 0;
  border-radius: 9px;
  background-color: oklch(54% 0.19 253);
  color: oklch(98% 0.004 240);
  font-weight: 760;

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    background-color: oklch(48% 0.2 253);
    color: oklch(98% 0.004 240);
  }

  &:disabled {
    cursor: not-allowed;
    background-color: oklch(68% 0.06 250);
  }

  @media (max-width: 575.98px) {
    width: 100%;
  }
`;
