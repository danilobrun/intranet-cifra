import { useMemo, useState } from "react";
import { Form, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faFileInvoiceDollar,
  faPen,
  faPlus,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import {
  downloadCsv,
  normalizeCsvFileName,
} from "../../helpers/csvExport";
import {
  RESUMO_CONTRATO_MONTH_OPTIONS,
  formatCurrency,
  formatCurrencyInputValue,
  getResumoContratoName,
  parseCurrencyInput,
} from "./utils";

const emptyFormData = {
  mes: "",
  bm: "",
  bmInicio: "",
  bmFim: "",
  valorBm: "",
  faturadoData: "",
};

const getBmId = (bm) => bm?.id || bm?._id || "";

const getDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const getShortDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
};

const getMonthLabel = (value) =>
  RESUMO_CONTRATO_MONTH_OPTIONS.find((month) => month.value === Number(value))
    ?.label || "-";

const getFullDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

const getCycleLabel = (bm) => {
  const startDate = getShortDate(bm?.bmInicio);
  const endDate = getShortDate(bm?.bmFim);

  if (startDate && endDate) {
    return `${startDate} a ${endDate}`;
  }

  if (startDate) {
    return `Início ${startDate}`;
  }

  if (endDate) {
    return `Fim ${endDate}`;
  }

  return "-";
};

const normalizeBmToFormData = (bm) => ({
  mes: String(bm?.mes || ""),
  bm: String(bm?.bm || ""),
  bmInicio: getDateInputValue(bm?.bmInicio),
  bmFim: getDateInputValue(bm?.bmFim),
  valorBm:
    bm?.valorBm === undefined || bm?.valorBm === null
      ? ""
      : formatCurrency(bm.valorBm),
  faturadoData: getDateInputValue(bm?.faturadoData),
});

const buildPayload = (formData, selectedYear) => {
  const parsedValue = parseCurrencyInput(formData.valorBm);

  if (!Number.isFinite(parsedValue)) {
    return {
      ok: false,
      msg: "Valor do BM inválido.",
    };
  }

  if (!formData.mes) {
    return {
      ok: false,
      msg: "Selecione o mês do BM.",
    };
  }

  return {
    ok: true,
    payload: {
      ano: selectedYear,
      mes: Number(formData.mes),
      bm: formData.bm.trim(),
      bmInicio: formData.bmInicio || null,
      bmFim: formData.bmFim || null,
      valorBm: parsedValue || 0,
      faturadoData: formData.faturadoData || null,
    },
  };
};

const buildMicroCsvRows = ({ contrato, bms, selectedYear }) => {
  const contratoName = getResumoContratoName(contrato);
  const clienteName = contrato?.cliente?.nome || "Sem cliente";

  const header = [
    "Cliente",
    "Contrato",
    "Ano",
    "Mês",
    "BM",
    "Início do ciclo",
    "Fim do ciclo",
    "Valor",
    "Data de faturamento",
    "Status de faturamento",
  ];

  const rows = bms.map((bm) => [
    clienteName,
    contratoName,
    bm.ano || selectedYear,
    getMonthLabel(bm.mes),
    bm.bm || "",
    getFullDate(bm.bmInicio),
    getFullDate(bm.bmFim),
    formatCurrency(bm.valorBm),
    getFullDate(bm.faturadoData),
    bm.faturadoData ? "Faturado" : "Não faturado",
  ]);

  return [header, ...rows];
};

export function ResumoContratoBmsTable({
  bms = [],
  contrato,
  selectedYear,
  isSubmiting = false,
  onCreateBm,
  onUpdateBm,
  onDeleteBm,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState(emptyFormData);
  const [editingBmId, setEditingBmId] = useState("");
  const [editFormData, setEditFormData] = useState(emptyFormData);
  const [deleteBmId, setDeleteBmId] = useState("");
  const [rowError, setRowError] = useState("");

  const sortedBms = useMemo(
    () =>
      [...bms].sort((left, right) => {
        const monthDiff = Number(left.mes || 0) - Number(right.mes || 0);

        if (monthDiff !== 0) {
          return monthDiff;
        }

        return new Date(left.createdAt || 0) - new Date(right.createdAt || 0);
      }),
    [bms],
  );

  const handleAddRow = () => {
    setIsCreating(true);
    setEditingBmId("");
    setDeleteBmId("");
    setRowError("");
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === "valorBm" ? formatCurrencyInputValue(value) : value;

    setCreateFormData((currentFormData) => ({
      ...currentFormData,
      [name]: nextValue,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === "valorBm" ? formatCurrencyInputValue(value) : value;

    setEditFormData((currentFormData) => ({
      ...currentFormData,
      [name]: nextValue,
    }));
  };

  const handleCreateBm = async () => {
    const result = buildPayload(createFormData, selectedYear);

    if (!result.ok) {
      setRowError(result.msg);
      return;
    }

    setRowError("");

    try {
      await onCreateBm(result.payload);
      setCreateFormData(emptyFormData);
      setIsCreating(false);
    } catch {
      // O toast é exibido pela view; a linha permanece aberta para correção.
    }
  };

  const startEdit = (bm) => {
    setEditingBmId(getBmId(bm));
    setEditFormData(normalizeBmToFormData(bm));
    setDeleteBmId("");
    setRowError("");
  };

  const cancelEdit = () => {
    setEditingBmId("");
    setEditFormData(emptyFormData);
    setRowError("");
  };

  const handleUpdateBm = async (bm) => {
    const result = buildPayload(editFormData, selectedYear);

    if (!result.ok) {
      setRowError(result.msg);
      return;
    }

    setRowError("");

    try {
      await onUpdateBm(getBmId(bm), result.payload);
      cancelEdit();
    } catch {
      // O toast é exibido pela view; a linha permanece aberta para correção.
    }
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setCreateFormData(emptyFormData);
    setRowError("");
  };

  const handleDeleteBm = async (bm) => {
    try {
      await onDeleteBm(getBmId(bm));
      setDeleteBmId("");
    } catch {
      // O toast é exibido pela view; a confirmação permanece disponível.
    }
  };

  const handleExportCsv = () => {
    if (!sortedBms.length) {
      return;
    }

    const contratoName = getResumoContratoName(contrato);
    const fileName = `bms-${normalizeCsvFileName(
      contratoName,
      "contrato",
    )}-${selectedYear}.csv`;
    const csvRows = buildMicroCsvRows({
      contrato,
      bms: sortedBms,
      selectedYear,
    });

    downloadCsv(fileName, csvRows);
  };

  return (
    <BmsSection>
      <BmsHeader>
        <HeaderContent>
          <SectionTitle>Lançamentos de BM</SectionTitle>
          <SectionDescription>
            Registre e acompanhe os BMs lançados para o ano selecionado.
          </SectionDescription>
        </HeaderContent>

        <HeaderActions>
          <ExportButton
            type="button"
            onClick={handleExportCsv}
            disabled={isSubmiting || !sortedBms.length}
            title={
              sortedBms.length
                ? "Exportar lançamentos de BM em CSV"
                : "Nenhum BM lançado para exportar"
            }
          >
            <FontAwesomeIcon icon={faDownload} />
            Exportar CSV
          </ExportButton>

          <LaunchButton
            type="button"
            onClick={handleAddRow}
            disabled={isSubmiting}
          >
            <FontAwesomeIcon icon={faPlus} />
            Lançar BM
          </LaunchButton>
        </HeaderActions>
      </BmsHeader>

      <TableCard>
        <TableScroll>
          <BmsTable $hasFormRow={isCreating || Boolean(editingBmId)}>
            <colgroup>
              <col style={{ width: "15%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "26%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "14%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Mês</th>
                <th>BM</th>
                <th>Ciclo do BM</th>
                <th>Valor</th>
                <th>Data de faturamento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {isCreating ? (
                <FormRow
                  formData={createFormData}
                  errorMsg={rowError}
                  isSubmiting={isSubmiting}
                  actionLabel="Lançar BM"
                  onChange={handleCreateChange}
                  onSubmit={handleCreateBm}
                  onCancel={cancelCreate}
                />
              ) : null}

              {sortedBms.length ? (
                sortedBms.map((bm) => {
                  const bmId = getBmId(bm);
                  const isEditing = bmId === editingBmId;
                  const isConfirmingDelete = bmId === deleteBmId;

                  if (isEditing) {
                    return (
                      <FormRow
                        key={bmId}
                        formData={editFormData}
                        errorMsg={rowError}
                        isSubmiting={isSubmiting}
                        actionLabel="Salvar"
                        onChange={handleEditChange}
                        onSubmit={() => handleUpdateBm(bm)}
                        onCancel={cancelEdit}
                      />
                    );
                  }

                  return (
                    <tr key={bmId}>
                      <td>{getMonthLabel(bm.mes)}</td>
                      <td>{bm.bm || "-"}</td>
                      <td>{getCycleLabel(bm)}</td>
                      <td>
                        <StrongValue>{formatCurrency(bm.valorBm)}</StrongValue>
                      </td>
                      <td>
                        {bm.faturadoData ? (
                          <BillingBadge $status="success">
                            Faturado em {getShortDate(bm.faturadoData)}
                          </BillingBadge>
                        ) : (
                          <BillingBadge $status="danger">
                            Não faturado
                          </BillingBadge>
                        )}
                      </td>
                      <td>
                        {isConfirmingDelete ? (
                          <ActionGroup>
                            <TextAction
                              type="button"
                              $variant="danger"
                              disabled={isSubmiting}
                              onClick={() => handleDeleteBm(bm)}
                            >
                              Confirmar
                            </TextAction>
                            <TextAction
                              type="button"
                              disabled={isSubmiting}
                              onClick={() => setDeleteBmId("")}
                            >
                              Cancelar
                            </TextAction>
                          </ActionGroup>
                        ) : (
                          <ActionGroup>
                            <IconAction
                              type="button"
                              title="Editar BM"
                              aria-label={`Editar ${bm.bm || "BM"}`}
                              disabled={isSubmiting}
                              onClick={() => startEdit(bm)}
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </IconAction>
                            <IconAction
                              type="button"
                              title="Excluir BM"
                              aria-label={`Excluir ${bm.bm || "BM"}`}
                              $variant="danger"
                              disabled={isSubmiting}
                              onClick={() => setDeleteBmId(bmId)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </IconAction>
                          </ActionGroup>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : !isCreating ? (
                <tr>
                  <EmptyCell colSpan={6}>Nenhum BM lançado.</EmptyCell>
                </tr>
              ) : null}
            </tbody>
          </BmsTable>
        </TableScroll>
      </TableCard>
    </BmsSection>
  );
}

function FormRow({
  formData,
  errorMsg,
  isSubmiting,
  actionLabel,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <tr>
      <td>
        <FieldStack>
          <InlineSelect
            name="mes"
            value={formData.mes}
            onChange={onChange}
            disabled={isSubmiting}
          >
            <option value="">Mês</option>
            {RESUMO_CONTRATO_MONTH_OPTIONS.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </InlineSelect>
          {errorMsg && !formData.mes ? (
            <InlineError>{errorMsg}</InlineError>
          ) : null}
        </FieldStack>
      </td>
      <td>
        <InlineControl
          type="text"
          name="bm"
          value={formData.bm}
          placeholder="BM-01"
          onChange={onChange}
          disabled={isSubmiting}
        />
      </td>
      <td>
        <CycleField aria-label="Ciclo do BM">
          <InlineControl
            type="date"
            name="bmInicio"
            value={formData.bmInicio}
            onChange={onChange}
            disabled={isSubmiting}
            aria-label="Início do ciclo do BM"
          />
          <CycleSeparator>-</CycleSeparator>
          <InlineControl
            type="date"
            name="bmFim"
            value={formData.bmFim}
            onChange={onChange}
            disabled={isSubmiting}
            aria-label="Fim do ciclo do BM"
          />
        </CycleField>
      </td>
      <td>
        <InlineControl
          type="text"
          name="valorBm"
          value={formData.valorBm}
          placeholder="R$ 0,00"
          inputMode="decimal"
          onChange={onChange}
          disabled={isSubmiting}
        />
        {errorMsg && formData.mes ? (
          <InlineError>{errorMsg}</InlineError>
        ) : null}
      </td>
      <td>
        <InlineControl
          type="date"
          name="faturadoData"
          value={formData.faturadoData}
          onChange={onChange}
          disabled={isSubmiting}
        />
      </td>
      <td>
        <ActionGroup>
          <TextAction
            type="button"
            $variant="primary"
            disabled={isSubmiting}
            onClick={onSubmit}
          >
            <FontAwesomeIcon icon={faFileInvoiceDollar} />
            {actionLabel}
          </TextAction>
          <IconAction
            type="button"
            title="Cancelar"
            aria-label="Cancelar"
            disabled={isSubmiting}
            onClick={onCancel}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconAction>
        </ActionGroup>
      </td>
    </tr>
  );
}

const BmsSection = styled.section`
  display: grid;
  gap: 12px;
  margin-top: 18px;
`;

const BmsHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const HeaderContent = styled.div`
  min-width: 220px;
`;

const HeaderActions = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 575.98px) {
    width: 100%;
    justify-content: stretch;

    button {
      flex: 1 1 150px;
    }
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: 1.08rem;
  font-weight: 760;
  line-height: 1.25;
`;

const SectionDescription = styled.p`
  margin: 5px 0 0;
  color: oklch(49% 0.018 245);
  font-size: 0.92rem;
`;

const HeaderButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 0.94rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;

  &:disabled {
    cursor: not-allowed;
  }
`;

const ExportButton = styled(HeaderButton)`
  border: 1px solid oklch(86% 0.012 245);
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
  }

  &:disabled {
    border-color: oklch(89% 0.009 245);
    background: oklch(95% 0.006 245);
    color: oklch(58% 0.014 245);
  }
`;

const LaunchButton = styled(HeaderButton)`
  border: 1px solid #0d6efd;
  background: #0d6efd;
  color: #ffffff;

  &:hover,
  &:focus {
    border-color: #0b5ed7;
    background: #0b5ed7;
    color: #ffffff;
  }

  &:disabled {
    border-color: oklch(83% 0.012 245);
    background: oklch(92% 0.006 245);
    color: oklch(55% 0.014 245);
  }
`;

const TableCard = styled.section`
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
  box-shadow: 0 10px 24px oklch(22% 0.018 245 / 0.06);
  overflow: hidden;
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const BmsTable = styled(Table)`
  min-width: ${({ $hasFormRow }) => ($hasFormRow ? "1240px" : "1040px")};
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;

  thead th {
    padding: 0.92rem 0.85rem;
    border: 0;
    background: linear-gradient(
      180deg,
      oklch(58% 0.012 245),
      oklch(51% 0.014 245)
    );
    color: oklch(98% 0.004 245);
    font-size: 0.82rem;
    font-weight: 760;
    line-height: 1.25;
    white-space: nowrap;
    vertical-align: middle;
  }

  tbody td {
    padding: 0.84rem 0.85rem;
    border-top: 0;
    border-bottom: 1px solid oklch(93% 0.006 245);
    background: oklch(99% 0.004 245);
    color: oklch(28% 0.016 245);
    font-size: 0.9rem;
    vertical-align: middle;
  }

  tbody tr:hover td {
    background: oklch(97.5% 0.006 245);
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }
`;

const FieldStack = styled.div`
  display: grid;
  gap: 5px;
`;

const controlStyles = `
  width: 100%;
  min-height: 38px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 8px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
  font-size: 0.88rem;
  outline: 0;

  &:focus {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.12);
  }

  &:disabled {
    background-color: oklch(94% 0.006 240);
    color: oklch(52% 0.014 245);
  }
`;

const InlineControl = styled(Form.Control)`
  ${controlStyles}
`;

const InlineSelect = styled(Form.Select)`
  ${controlStyles}
`;

const CycleField = styled.div`
  display: grid;
  grid-template-columns: minmax(135px, 1fr) auto minmax(135px, 1fr);
  align-items: center;
  gap: 8px;
`;

const CycleSeparator = styled.span`
  color: oklch(49% 0.018 245);
  font-weight: 700;
`;

const InlineError = styled.span`
  color: oklch(45% 0.18 25);
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.2;
`;

const StrongValue = styled.strong`
  color: oklch(24% 0.018 245);
  font-weight: 760;
  white-space: nowrap;
`;

const BillingBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid
    ${({ $status }) =>
      $status === "success" ? "oklch(79% 0.08 152)" : "oklch(82% 0.07 25)"};
  background: ${({ $status }) =>
    $status === "success" ? "oklch(96% 0.03 152)" : "oklch(97% 0.018 25)"};
  color: ${({ $status }) =>
    $status === "success" ? "oklch(36% 0.1 152)" : "oklch(43% 0.13 25)"};
  font-size: 0.8rem;
  font-weight: 760;
  white-space: nowrap;
`;

const ActionGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const IconAction = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
  color: ${({ $variant }) =>
    $variant === "danger" ? "oklch(50% 0.18 25)" : "oklch(38% 0.018 245)"};

  &:hover,
  &:focus {
    border-color: ${({ $variant }) =>
      $variant === "danger" ? "oklch(76% 0.11 25)" : "oklch(78% 0.018 245)"};
    background: ${({ $variant }) =>
      $variant === "danger" ? "oklch(96% 0.018 25)" : "oklch(96% 0.006 245)"};
    color: ${({ $variant }) =>
      $variant === "danger" ? "oklch(45% 0.18 25)" : "oklch(22% 0.018 245)"};
  }

  &:disabled {
    opacity: 0.62;
    cursor: not-allowed;
  }
`;

const TextAction = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 11px;
  border: 1px solid
    ${({ $variant }) =>
      $variant === "danger"
        ? "oklch(76% 0.11 25)"
        : $variant === "primary"
          ? "#0d6efd"
          : "oklch(86% 0.012 245)"};
  border-radius: 8px;
  background: ${({ $variant }) =>
    $variant === "danger"
      ? "oklch(96% 0.018 25)"
      : $variant === "primary"
        ? "#0d6efd"
        : "oklch(99% 0.004 245)"};
  color: ${({ $variant }) =>
    $variant === "danger"
      ? "oklch(45% 0.18 25)"
      : $variant === "primary"
        ? "#ffffff"
        : "oklch(31% 0.018 245)"};
  font-size: 0.82rem;
  font-weight: 760;
  white-space: nowrap;

  &:disabled {
    opacity: 0.62;
    cursor: not-allowed;
  }
`;

const EmptyCell = styled.td`
  padding: 28px !important;
  color: oklch(49% 0.018 245) !important;
  text-align: center;
`;
