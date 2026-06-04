import { useEffect, useMemo, useRef, useState } from "react";
import { Form, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faFileInvoiceDollar,
  faPlus,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { BOLETIM_MONTH_OPTIONS } from "./options";

const getTodayInputValue = () => {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return localDate.toISOString().slice(0, 10);
};

const emptyFormData = {
  contratoId: "",
  numeroBm: "",
  mes: "",
  ano: "",
  valorBm: "",
  reajuste: "",
  dataRegistro: getTodayInputValue(),
  observacoes: "",
};

const MONEY_FIELD_NAMES = new Set([
  "valorBm",
  "reajuste",
  "valorFaturado",
  "valorPago",
]);

const getId = (item) => item?._id || item?.id || "";

const createLocalId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

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

const getContrato = (boletim) => {
  if (boletim?.contrato) {
    return boletim.contrato;
  }

  return typeof boletim?.contratoId === "object" ? boletim.contratoId : null;
};

const getUserName = (user) => {
  if (!user) {
    return "";
  }

  return typeof user === "string" ? user : user.name || "";
};

const getContractLabel = (contract) => {
  const code = contract?.codigo ? `${contract.codigo} - ` : "";
  return `${code}${contract?.nomeContrato || "Contrato"}`;
};

const roundMoney = (value) => Number(Number(value || 0).toFixed(2));

const toCents = (value) => Math.round(Number(value || 0) * 100);

const fromCents = (value) => Number((value / 100).toFixed(2));

const parseMoneyInput = (
  value,
  { required = false, positive = false, fieldLabel = "Valor" } = {},
) => {
  const text = String(value ?? "").trim();

  if (!text) {
    if (required) {
      return {
        ok: false,
        msg: `${fieldLabel} e obrigatorio.`,
      };
    }

    return {
      ok: true,
      value: 0,
    };
  }

  const cleaned = text.replace(/[^\d,.-]/g, "");
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue)) {
    return {
      ok: false,
      msg: `${fieldLabel} precisa ser numerico.`,
    };
  }

  if (positive && numberValue <= 0) {
    return {
      ok: false,
      msg: `${fieldLabel} precisa ser maior que zero.`,
    };
  }

  return {
    ok: true,
    value: roundMoney(numberValue),
  };
};

const isValidDateInput = (value) => {
  if (!value) {
    return false;
  }

  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

const formatCurrencyInputValue = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return formatCurrency(Number(digits) / 100);
};

const formatYearInputValue = (value) =>
  String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 4);

const formatCurrencyFromCents = (value) => formatCurrency(fromCents(value));

const formatDate = (value) => {
  const inputValue = getDateInputValue(value);

  if (!inputValue) {
    return "-";
  }

  const [year, month, day] = inputValue.split("-");
  return `${day}/${month}/${year}`;
};

const getStatusTone = (status) => {
  const normalizedStatus = normalizeText(status);

  if (normalizedStatus === "faturado" || normalizedStatus === "pago") {
    return "success";
  }

  if (normalizedStatus.includes("parcial")) {
    return "warning";
  }

  if (normalizedStatus === "nao pago") {
    return "danger";
  }

  return "muted";
};

const getFormDataFromBoletim = (boletim) => ({
  numeroBm: String(boletim?.numeroBm || ""),
  mes: boletim?.mes ? String(boletim.mes) : "",
  ano: boletim?.ano ? String(boletim.ano) : "",
  valorBm:
    boletim?.valorBm !== undefined && boletim?.valorBm !== null
      ? formatCurrency(boletim.valorBm)
      : "",
  reajuste:
    boletim?.reajuste !== undefined && boletim?.reajuste !== null
      ? formatCurrency(boletim.reajuste)
      : "",
  dataRegistro: getDateInputValue(boletim?.dataRegistro),
  observacoes: String(boletim?.observacoes || ""),
});

const getInitialFormData = (mode, boletim) =>
  mode === "edit" ? getFormDataFromBoletim(boletim) : emptyFormData;

const getEmptyFaturamentoDraft = (mode) => ({
  valorFaturado: "",
  dataFaturamento: mode === "create" ? getTodayInputValue() : "",
});

const getEmptyPagamentoDraft = (mode) => ({
  valorPago: "",
  dataPagamento: mode === "create" ? getTodayInputValue() : "",
});

const getTotalCents = (items, fieldName) =>
  items.reduce((total, item) => total + toCents(item[fieldName]), 0);

function FinancialSummary({ boletim }) {
  const summaryItems = [
    {
      label: "Valor Total BM",
      value: formatCurrency(boletim?.valorTotalBm),
      type: "money",
    },
    {
      label: "Total Faturado",
      value: formatCurrency(boletim?.totalFaturado),
      type: "money",
    },
    {
      label: "Pend. Faturamento",
      value: formatCurrency(boletim?.pendenteFaturamento),
      type: "money",
    },
    {
      label: "Total Pago",
      value: formatCurrency(boletim?.totalPago),
      type: "money",
    },
    {
      label: "Pend. Pagamento",
      value: formatCurrency(boletim?.pendentePagamento),
      type: "money",
    },
    {
      label: "Status Faturamento",
      value: boletim?.statusFaturamento || "-",
      type: "status",
      tone: getStatusTone(boletim?.statusFaturamento),
    },
    {
      label: "Status Pagamento",
      value: boletim?.statusPagamento || "-",
      type: "status",
      tone: getStatusTone(boletim?.statusPagamento),
    },
  ];

  return (
    <SummarySection>
      <SectionHeader>
        <SectionTitle>Resumo Financeiro</SectionTitle>
      </SectionHeader>

      <SummaryGrid>
        {summaryItems.map((item) => (
          <SummaryItem key={item.label}>
            <SummaryLabel>{item.label}</SummaryLabel>
            {item.type === "status" ? (
              <StatusBadge $tone={item.tone}>{item.value}</StatusBadge>
            ) : (
              <SummaryValue>{item.value}</SummaryValue>
            )}
          </SummaryItem>
        ))}
      </SummaryGrid>
    </SummarySection>
  );
}

function LaunchTable({
  items,
  valueKey,
  dateKey,
  valueHeader,
  dateHeader,
  removeLabel,
  emptyText,
  confirmAction,
  onAskDelete,
  onRemove,
  onCancelDelete,
  onConfirmDelete,
}) {
  const handleRemove = (item) => {
    if (onAskDelete) {
      onAskDelete(item);
      return;
    }

    onRemove?.(getId(item));
  };

  return (
    <>
      <TableScroll>
        <LaunchTableStyled>
          <thead>
            <tr>
              <th>{valueHeader}</th>
              <th>{dateHeader}</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((item) => (
                <tr key={getId(item)}>
                  <td>{formatCurrency(item[valueKey])}</td>
                  <td>{formatDate(item[dateKey])}</td>
                  <td>
                    <IconAction
                      type="button"
                      title={removeLabel}
                      aria-label={removeLabel}
                      $variant="danger"
                      onClick={() => handleRemove(item)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </IconAction>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <EmptyLaunchCell colSpan={3}>{emptyText}</EmptyLaunchCell>
              </tr>
            )}
          </tbody>
        </LaunchTableStyled>
      </TableScroll>

      {confirmAction ? (
        <InlineConfirm>
          <ConfirmText>{confirmAction.message}</ConfirmText>
          <ConfirmActions>
            <SecondarySmallButton type="button" onClick={onCancelDelete}>
              <FontAwesomeIcon icon={faXmark} />
              Cancelar
            </SecondarySmallButton>
            <DangerSmallButton type="button" onClick={onConfirmDelete}>
              <FontAwesomeIcon icon={faCheck} />
              Confirmar
            </DangerSmallButton>
          </ConfirmActions>
        </InlineConfirm>
      ) : null}
    </>
  );
}

export function BoletimForm({
  mode = "create",
  contractOptions = [],
  isLoadingContracts = false,
  boletim,
  faturamentos = [],
  pagamentos = [],
  buttonLabel,
  onSubmit,
  onAddFaturamento,
  onDeleteFaturamento,
  onAddPagamento,
  onDeletePagamento,
}) {
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [formData, setFormData] = useState(() =>
    getInitialFormData(mode, boletim),
  );
  const [faturamentoDraft, setFaturamentoDraft] = useState(() =>
    getEmptyFaturamentoDraft(mode),
  );
  const [pagamentoDraft, setPagamentoDraft] = useState(() =>
    getEmptyPagamentoDraft(mode),
  );
  const [temporaryFaturamentos, setTemporaryFaturamentos] = useState([]);
  const [temporaryPagamentos, setTemporaryPagamentos] = useState([]);
  const [confirmAction, setConfirmAction] = useState();
  const formSourceKeyRef = useRef(`${mode}:${getId(boletim) || "create"}`);

  useEffect(() => {
    const nextFormSourceKey = `${mode}:${getId(boletim) || "create"}`;

    if (formSourceKeyRef.current === nextFormSourceKey) {
      return;
    }

    formSourceKeyRef.current = nextFormSourceKey;
    setFormData(getInitialFormData(mode, boletim));
    setFaturamentoDraft(getEmptyFaturamentoDraft(mode));
    setPagamentoDraft(getEmptyPagamentoDraft(mode));
    setConfirmAction(undefined);
  }, [boletim, mode]);

  const selectedContract = useMemo(
    () =>
      contractOptions.find(
        (contract) => getId(contract) === formData.contratoId,
      ),
    [contractOptions, formData.contratoId],
  );
  const contrato = isCreateMode ? selectedContract : getContrato(boletim);
  const isFullyBilled =
    isEditMode && normalizeText(boletim?.statusFaturamento) === "faturado";
  const faturamentoItems = isCreateMode ? temporaryFaturamentos : faturamentos;
  const pagamentoItems = isCreateMode ? temporaryPagamentos : pagamentos;
  const valorBmResult = useMemo(
    () => parseMoneyInput(formData.valorBm),
    [formData.valorBm],
  );
  const reajusteResult = useMemo(
    () => parseMoneyInput(formData.reajuste),
    [formData.reajuste],
  );
  const valorTotalBmCents =
    toCents(valorBmResult.ok ? valorBmResult.value : 0) +
    toCents(reajusteResult.ok ? reajusteResult.value : 0);
  const totalFaturadoCents = isCreateMode
    ? getTotalCents(temporaryFaturamentos, "valorFaturado")
    : toCents(boletim?.totalFaturado);
  const totalPagoCents = isCreateMode
    ? getTotalCents(temporaryPagamentos, "valorPago")
    : toCents(boletim?.totalPago);
  const submitButtonLabel =
    buttonLabel || (isCreateMode ? "Cadastrar boletim" : "Salvar boletim");

  const setValidationError = (message) => {
    toast.error(message);
    return false;
  };

  const handleChange = (event) => {
    const { name, value: rawValue } = event.target;
    const value =
      name === "ano"
        ? formatYearInputValue(rawValue)
        : MONEY_FIELD_NAMES.has(name)
          ? formatCurrencyInputValue(rawValue)
          : rawValue;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleFaturamentoDraftChange = (event) => {
    const { name } = event.target;
    const value = MONEY_FIELD_NAMES.has(name)
      ? formatCurrencyInputValue(event.target.value)
      : event.target.value;

    setFaturamentoDraft((currentDraft) => ({
      ...currentDraft,
      [name]: value,
    }));
  };

  const handlePagamentoDraftChange = (event) => {
    const { name } = event.target;
    const value = MONEY_FIELD_NAMES.has(name)
      ? formatCurrencyInputValue(event.target.value)
      : event.target.value;

    setPagamentoDraft((currentDraft) => ({
      ...currentDraft,
      [name]: value,
    }));
  };

  const getPayload = () => {
    if (isCreateMode && !formData.contratoId) {
      return {
        ok: false,
        msg: "Selecione um contrato ativo.",
      };
    }

    if (!formData.numeroBm.trim()) {
      return {
        ok: false,
        msg: "Informe o No. do BM.",
      };
    }

    if (!formData.mes) {
      return {
        ok: false,
        msg: "Selecione o mes.",
      };
    }

    if (!/^\d{4}$/.test(String(formData.ano).trim())) {
      return {
        ok: false,
        msg: "Informe um ano com 4 digitos.",
      };
    }

    const valorBmPayloadResult = parseMoneyInput(formData.valorBm, {
      required: true,
      fieldLabel: "Valor do BM",
    });

    if (!valorBmPayloadResult.ok) {
      return valorBmPayloadResult;
    }

    const reajustePayloadResult = parseMoneyInput(formData.reajuste, {
      fieldLabel: "Reajuste",
    });

    if (!reajustePayloadResult.ok) {
      return reajustePayloadResult;
    }

    if (!isValidDateInput(formData.dataRegistro)) {
      return {
        ok: false,
        msg: "Data de registro é obrigatória.",
      };
    }

    if (isCreateMode) {
      const nextValorTotalBmCents =
        toCents(valorBmPayloadResult.value) +
        toCents(reajustePayloadResult.value);

      if (totalFaturadoCents > nextValorTotalBmCents) {
        return {
          ok: false,
          msg: "A soma dos faturamentos não pode ultrapassar o Valor Total do BM.",
        };
      }

      if (totalPagoCents > totalFaturadoCents) {
        return {
          ok: false,
          msg: "A soma dos pagamentos não pode ultrapassar a soma dos faturamentos.",
        };
      }

      return {
        ok: true,
        data: {
          boletim: {
            contratoId: formData.contratoId,
            numeroBm: formData.numeroBm.trim(),
            mes: Number(formData.mes),
            ano: Number(formData.ano),
            valorBm: valorBmPayloadResult.value,
            reajuste: reajustePayloadResult.value,
            dataRegistro: formData.dataRegistro,
            observacoes: formData.observacoes.trim(),
          },
          faturamentos: temporaryFaturamentos.map((item) => ({
            valorFaturado: item.valorFaturado,
            dataFaturamento: item.dataFaturamento,
          })),
          pagamentos: temporaryPagamentos.map((item) => ({
            valorPago: item.valorPago,
            dataPagamento: item.dataPagamento,
          })),
        },
      };
    }

    return {
      ok: true,
      data: {
        numeroBm: formData.numeroBm.trim(),
        mes: Number(formData.mes),
        ano: Number(formData.ano),
        valorBm: valorBmPayloadResult.value,
        reajuste: reajustePayloadResult.value,
        dataRegistro: formData.dataRegistro,
        observacoes: formData.observacoes.trim(),
      },
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payloadResult = getPayload();

    if (!payloadResult.ok) {
      setValidationError(payloadResult.msg);
      return;
    }

    try {
      setIsSubmiting(true);
      await onSubmit(payloadResult.data);
    } finally {
      setIsSubmiting(false);
    }
  };

  const handleAddFaturamento = async () => {
    if (isFullyBilled) {
      setValidationError("Boletim já está totalmente faturado.");
      return;
    }

    const valorResult = parseMoneyInput(faturamentoDraft.valorFaturado, {
      required: true,
      positive: true,
      fieldLabel: "Valor faturado",
    });

    if (!valorResult.ok) {
      setValidationError(valorResult.msg);
      return;
    }

    if (!isValidDateInput(faturamentoDraft.dataFaturamento)) {
      setValidationError("Data do faturamento é obrigatória.");
      return;
    }

    const nextTotalFaturadoCents =
      totalFaturadoCents + toCents(valorResult.value);

    if (nextTotalFaturadoCents > valorTotalBmCents) {
      setValidationError(
        "A soma dos faturamentos não pode ultrapassar o Valor Total do BM.",
      );
      return;
    }

    if (isCreateMode) {
      setTemporaryFaturamentos((currentItems) => [
        ...currentItems,
        {
          id: createLocalId(),
          valorFaturado: valorResult.value,
          dataFaturamento: faturamentoDraft.dataFaturamento,
        },
      ]);
      setFaturamentoDraft(getEmptyFaturamentoDraft(mode));
      return;
    }

    try {
      setIsLaunching(true);
      await onAddFaturamento({
        valorFaturado: valorResult.value,
        dataFaturamento: faturamentoDraft.dataFaturamento,
      });
      setFaturamentoDraft(getEmptyFaturamentoDraft(mode));
    } finally {
      setIsLaunching(false);
    }
  };

  const handleAddPagamento = async () => {
    const valorResult = parseMoneyInput(pagamentoDraft.valorPago, {
      required: true,
      positive: true,
      fieldLabel: "Valor pago",
    });

    if (!valorResult.ok) {
      setValidationError(valorResult.msg);
      return;
    }

    if (!isValidDateInput(pagamentoDraft.dataPagamento)) {
      setValidationError("Data do pagamento é obrigatória.");
      return;
    }

    const nextTotalPagoCents = totalPagoCents + toCents(valorResult.value);

    if (nextTotalPagoCents > totalFaturadoCents) {
      setValidationError(
        isCreateMode
          ? "A soma dos pagamentos não pode ultrapassar a soma dos faturamentos."
          : "A soma dos pagamentos não pode ultrapassar o total faturado.",
      );
      return;
    }

    if (isCreateMode) {
      setTemporaryPagamentos((currentItems) => [
        ...currentItems,
        {
          id: createLocalId(),
          valorPago: valorResult.value,
          dataPagamento: pagamentoDraft.dataPagamento,
        },
      ]);
      setPagamentoDraft(getEmptyPagamentoDraft(mode));
      return;
    }

    try {
      setIsLaunching(true);
      await onAddPagamento({
        valorPago: valorResult.value,
        dataPagamento: pagamentoDraft.dataPagamento,
      });
      setPagamentoDraft(getEmptyPagamentoDraft(mode));
    } finally {
      setIsLaunching(false);
    }
  };

  const handleRemoveFaturamento = (itemId) => {
    const nextFaturamentos = temporaryFaturamentos.filter(
      (item) => item.id !== itemId,
    );
    const nextTotalFaturadoCents = getTotalCents(
      nextFaturamentos,
      "valorFaturado",
    );

    if (nextTotalFaturadoCents < totalPagoCents) {
      setValidationError(
        "Remova pagamentos antes de reduzir o total faturado abaixo do total pago.",
      );
      return;
    }

    setTemporaryFaturamentos(nextFaturamentos);
  };

  const handleRemovePagamento = (itemId) => {
    setTemporaryPagamentos((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  };

  const askDeleteFaturamento = (item) => {
    setConfirmAction({
      type: "faturamento",
      item,
      message: `Confirma excluir o faturamento de ${formatCurrency(
        item.valorFaturado,
      )}?`,
    });
  };

  const askDeletePagamento = (item) => {
    setConfirmAction({
      type: "pagamento",
      item,
      message: `Confirma excluir o pagamento de ${formatCurrency(
        item.valorPago,
      )}?`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmAction?.item) {
      return;
    }

    try {
      setIsLaunching(true);

      if (confirmAction.type === "faturamento") {
        await onDeleteFaturamento(getId(confirmAction.item));
      } else {
        await onDeletePagamento(getId(confirmAction.item));
      }

      setConfirmAction(undefined);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <BoletimFormStyled onSubmit={handleSubmit}>
      <FormSection>
        <SectionHeader>
          <SectionTitle>Dados do Boletim</SectionTitle>
          <SectionDescription>
            {isCreateMode
              ? "Identificacao do BM e vinculo com o contrato ativo."
              : "Edite os dados principais sem alterar o contrato vinculado."}
          </SectionDescription>
        </SectionHeader>

        <FieldsGrid>
          <FullWidthFieldGroup controlId="boletim-contrato">
            <FieldLabel>Contrato</FieldLabel>
            {isCreateMode ? (
              <FieldSelect
                name="contratoId"
                value={formData.contratoId}
                onChange={handleChange}
                disabled={isLoadingContracts || !contractOptions.length}
                required
              >
                <option value="">
                  {isLoadingContracts
                    ? "Carregando contratos..."
                    : "Selecione um contrato ativo"}
                </option>
                {contractOptions.map((contract) => (
                  <option key={getId(contract)} value={getId(contract)}>
                    {getContractLabel(contract)}
                  </option>
                ))}
              </FieldSelect>
            ) : (
              <FieldControl
                type="text"
                value={getContractLabel(contrato)}
                readOnly
              />
            )}
          </FullWidthFieldGroup>

          <FieldGroup controlId="boletim-cliente">
            <FieldLabel>Cliente</FieldLabel>
            <FieldControl
              type="text"
              value={contrato?.cliente || ""}
              placeholder="Selecione um contrato"
              readOnly
            />
          </FieldGroup>

          <FieldGroup controlId="boletim-estado">
            <FieldLabel>Estado</FieldLabel>
            <FieldControl
              type="text"
              value={contrato?.estado || ""}
              placeholder="Selecione um contrato"
              readOnly
            />
          </FieldGroup>

          <FieldGroup controlId="boletim-gestor">
            <FieldLabel>Gestor</FieldLabel>
            <FieldControl
              type="text"
              value={getUserName(contrato?.gestorId)}
              placeholder="Selecione um contrato"
              readOnly
            />
          </FieldGroup>

          <FieldGroup controlId="boletim-numero">
            <FieldLabel>No. do BM</FieldLabel>
            <FieldControl
              type="text"
              name="numeroBm"
              value={formData.numeroBm}
              onChange={handleChange}
              placeholder="Ex.: BM-01/2026"
              required
            />
          </FieldGroup>

          <FieldGroup controlId="boletim-mes">
            <FieldLabel>Mês</FieldLabel>
            <FieldSelect
              name="mes"
              value={formData.mes}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              {BOLETIM_MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </FieldSelect>
          </FieldGroup>

          <FieldGroup controlId="boletim-ano">
            <FieldLabel>Ano</FieldLabel>
            <FieldControl
              type="text"
              name="ano"
              value={formData.ano}
              onChange={handleChange}
              placeholder="Ex.: 2026"
              inputMode="numeric"
              maxLength={4}
              pattern="[0-9]{4}"
              required
            />
          </FieldGroup>

          <FullWidthFieldsRow>
            <FieldGroup controlId="boletim-data-registro">
              <FieldLabel>Data de Registro</FieldLabel>
              <FieldControl
                type="date"
                name="dataRegistro"
                value={formData.dataRegistro}
                onChange={handleChange}
                required
              />
            </FieldGroup>

            <FieldGroup controlId="boletim-valor">
              <FieldLabel>Valor do BM</FieldLabel>
              <FieldControl
                type="text"
                name="valorBm"
                value={formData.valorBm}
                onChange={handleChange}
                placeholder="R$ 0,00"
                inputMode="decimal"
                disabled={isFullyBilled}
                required
              />
            </FieldGroup>

            <FieldGroup controlId="boletim-reajuste">
              <FieldLabel>Reajuste (opcional)</FieldLabel>
              <FieldControl
                type="text"
                name="reajuste"
                value={formData.reajuste}
                onChange={handleChange}
                placeholder="R$ 0,00"
                inputMode="decimal"
                disabled={isFullyBilled}
              />
            </FieldGroup>

            <FieldGroup controlId="boletim-valor-total">
              <FieldLabel>Valor Total do BM</FieldLabel>
              <FieldControl
                type="text"
                value={formatCurrencyFromCents(valorTotalBmCents)}
                readOnly
              />
            </FieldGroup>
          </FullWidthFieldsRow>

          <FullWidthFieldGroup controlId="boletim-observacoes">
            <FieldLabel>Observações</FieldLabel>
            <DescriptionControl
              as="textarea"
              rows={4}
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Opcional"
            />
          </FullWidthFieldGroup>
        </FieldsGrid>
      </FormSection>

      {isEditMode ? <FinancialSummary boletim={boletim} /> : null}

      <FormSection>
        <SectionHeader>
          <SectionTitle>Faturamentos</SectionTitle>
          <SectionDescription>
            {isCreateMode
              ? "Lancamentos opcionais que serao vinculados ao BM apos o cadastro."
              : "Cadastre novos faturamentos ou exclua lancamentos incorretos."}
          </SectionDescription>
        </SectionHeader>

        <LaunchFieldsGrid>
          <FieldGroup controlId="faturamento-valor">
            <FieldLabel>Valor faturado</FieldLabel>
            <FieldControl
              type="text"
              name="valorFaturado"
              value={faturamentoDraft.valorFaturado}
              onChange={handleFaturamentoDraftChange}
              placeholder="R$ 0,00"
              inputMode="decimal"
              disabled={isFullyBilled || isLaunching}
            />
          </FieldGroup>

          <FieldGroup controlId="faturamento-data">
            <FieldLabel>Data do faturamento</FieldLabel>
            <FieldControl
              type="date"
              name="dataFaturamento"
              value={faturamentoDraft.dataFaturamento}
              onChange={handleFaturamentoDraftChange}
              disabled={isFullyBilled || isLaunching}
            />
          </FieldGroup>

          <AddButtonCell>
            <AddAction
              type="button"
              disabled={isFullyBilled || isLaunching}
              onClick={handleAddFaturamento}
            >
              <FontAwesomeIcon icon={faPlus} />
              Adicionar faturamento
            </AddAction>
          </AddButtonCell>
        </LaunchFieldsGrid>

        <LaunchTable
          items={faturamentoItems}
          valueKey="valorFaturado"
          dateKey="dataFaturamento"
          valueHeader="Valor faturado"
          dateHeader="Data do faturamento"
          emptyText={
            isCreateMode
              ? "Nenhum faturamento adicionado."
              : "Nenhum faturamento cadastrado."
          }
          removeLabel={
            isCreateMode ? "Remover faturamento" : "Excluir faturamento"
          }
          confirmAction={
            isEditMode && confirmAction?.type === "faturamento"
              ? confirmAction
              : undefined
          }
          onAskDelete={isEditMode ? askDeleteFaturamento : undefined}
          onRemove={handleRemoveFaturamento}
          onCancelDelete={() => setConfirmAction(undefined)}
          onConfirmDelete={handleConfirmDelete}
        />

        <TotalsRow>
          Total faturado:{" "}
          <strong>{formatCurrencyFromCents(totalFaturadoCents)}</strong>
        </TotalsRow>
      </FormSection>

      <FormSection>
        <SectionHeader>
          <SectionTitle>Pagamentos</SectionTitle>
          <SectionDescription>
            {isCreateMode
              ? "Lancamentos opcionais vinculados diretamente ao BM."
              : "Cadastre novos pagamentos ou exclua lancamentos incorretos."}
          </SectionDescription>
        </SectionHeader>

        <LaunchFieldsGrid>
          <FieldGroup controlId="pagamento-valor">
            <FieldLabel>Valor pago</FieldLabel>
            <FieldControl
              type="text"
              name="valorPago"
              value={pagamentoDraft.valorPago}
              onChange={handlePagamentoDraftChange}
              placeholder="R$ 0,00"
              inputMode="decimal"
              disabled={isLaunching}
            />
          </FieldGroup>

          <FieldGroup controlId="pagamento-data">
            <FieldLabel>Data do pagamento</FieldLabel>
            <FieldControl
              type="date"
              name="dataPagamento"
              value={pagamentoDraft.dataPagamento}
              onChange={handlePagamentoDraftChange}
              disabled={isLaunching}
            />
          </FieldGroup>

          <AddButtonCell>
            <AddAction
              type="button"
              disabled={isLaunching}
              onClick={handleAddPagamento}
            >
              <FontAwesomeIcon icon={faPlus} />
              Adicionar pagamento
            </AddAction>
          </AddButtonCell>
        </LaunchFieldsGrid>

        <LaunchTable
          items={pagamentoItems}
          valueKey="valorPago"
          dateKey="dataPagamento"
          valueHeader="Valor pago"
          dateHeader="Data do pagamento"
          emptyText={
            isCreateMode
              ? "Nenhum pagamento adicionado."
              : "Nenhum pagamento cadastrado."
          }
          removeLabel={isCreateMode ? "Remover pagamento" : "Excluir pagamento"}
          confirmAction={
            isEditMode && confirmAction?.type === "pagamento"
              ? confirmAction
              : undefined
          }
          onAskDelete={isEditMode ? askDeletePagamento : undefined}
          onRemove={handleRemovePagamento}
          onCancelDelete={() => setConfirmAction(undefined)}
          onConfirmDelete={handleConfirmDelete}
        />

        <TotalsRow>
          Total pago: <strong>{formatCurrencyFromCents(totalPagoCents)}</strong>
        </TotalsRow>
      </FormSection>

      <ActionsBar>
        <SecondaryAction as={Link} to="/boletins">
          Cancelar
        </SecondaryAction>
        <PrimaryAction type="submit" disabled={isSubmiting || isLaunching}>
          <FontAwesomeIcon icon={faFileInvoiceDollar} />
          {isSubmiting ? "Salvando..." : submitButtonLabel}
        </PrimaryAction>
      </ActionsBar>
    </BoletimFormStyled>
  );
}

export function CreateBoletimForm(props) {
  return <BoletimForm mode="create" {...props} />;
}

export function EditBoletimForm(props) {
  return <BoletimForm mode="edit" {...props} />;
}

const BoletimFormStyled = styled(Form)`
  display: grid;
  gap: 20px;
  padding-bottom: 34px;
`;

const FormSection = styled.section`
  padding: 22px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  box-shadow: 0 10px 24px oklch(22% 0.018 245 / 0.06);

  @media (max-width: 575.98px) {
    padding: 18px;
  }
`;

const SummarySection = styled(FormSection)`
  border: 2px solid oklch(72% 0.085 253);
  background: linear-gradient(
    180deg,
    oklch(98% 0.012 253),
    oklch(99% 0.004 245)
  );
  box-shadow: 0 14px 30px oklch(42% 0.08 253 / 0.13);
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px 20px;

  @media (max-width: 991.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const FullWidthFieldsRow = styled.div`
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px 20px;

  @media (max-width: 991.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const LaunchFieldsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) auto;
  gap: 18px 20px;
  align-items: end;
  margin-bottom: 18px;

  @media (max-width: 991.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 575.98px) {
    grid-template-columns: 1fr;
  }
`;

const FieldGroup = styled(Form.Group)`
  display: grid;
  min-width: 0;
  gap: 8px;
`;

const FullWidthFieldGroup = styled(FieldGroup)`
  grid-column: 1 / -1;
`;

const FieldLabel = styled(Form.Label)`
  margin: 0;
  color: oklch(28% 0.016 245);
  font-size: 0.92rem;
  font-weight: 700;
`;

const controlStyles = `
  min-height: 50px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 10px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
  font-size: 0.98rem;
  outline: 0;
  box-shadow: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;

  &:focus,
  &:focus-visible {
    outline: 0;
    border-color: oklch(55% 0.17 253);
    background-color: oklch(99.2% 0.004 240);
    box-shadow: 0 0 0 0.22rem oklch(55% 0.17 253 / 0.14);
  }

  &:read-only {
    background-color: oklch(96% 0.006 240);
    color: oklch(40% 0.014 245);
  }

  &:disabled {
    background-color: oklch(94% 0.006 240);
    color: oklch(52% 0.014 245);
  }
`;

const FieldControl = styled(Form.Control)`
  ${controlStyles}
`;

const DescriptionControl = styled(FieldControl)`
  padding: 12px 14px;
  line-height: 1.45;
  resize: vertical;
`;

const FieldSelect = styled(Form.Select)`
  ${controlStyles}

  &:not(:disabled) {
    background-color: oklch(99% 0.004 240);
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1199.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 575.98px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryItem = styled.article`
  min-width: 0;
  min-height: 76px;
  padding: 14px;
  border: 1px solid oklch(82% 0.045 253);
  border-radius: 8px;
  background: oklch(99.4% 0.006 245);
`;

const SummaryLabel = styled.span`
  display: block;
  color: oklch(49% 0.018 245);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
`;

const SummaryValue = styled.strong`
  display: block;
  margin-top: 8px;
  color: oklch(24% 0.018 245);
  font-size: 1rem;
  font-weight: 760;
  line-height: 1.2;
  overflow-wrap: anywhere;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  margin-top: 8px;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid
    ${({ $tone }) =>
      ({
        success: "oklch(79% 0.08 152)",
        warning: "oklch(84% 0.08 75)",
        danger: "oklch(80% 0.09 25)",
        muted: "oklch(84% 0.012 245)",
      })[$tone] || "oklch(84% 0.012 245)"};
  background: ${({ $tone }) =>
    ({
      success: "oklch(96% 0.03 152)",
      warning: "oklch(97% 0.035 75)",
      danger: "oklch(96% 0.018 25)",
      muted: "oklch(96% 0.006 245)",
    })[$tone] || "oklch(96% 0.006 245)"};
  color: ${({ $tone }) =>
    ({
      success: "oklch(36% 0.1 152)",
      warning: "oklch(43% 0.08 75)",
      danger: "oklch(45% 0.18 25)",
      muted: "oklch(42% 0.018 245)",
    })[$tone] || "oklch(42% 0.018 245)"};
  font-size: 0.78rem;
  font-weight: 760;
  white-space: nowrap;
`;

const AddButtonCell = styled.div`
  display: flex;
  align-items: flex-end;

  @media (max-width: 991.98px) {
    grid-column: 1 / -1;
  }
`;

const AddAction = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 18px;
  border: 1px solid oklch(78% 0.018 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);
  font-weight: 700;
  white-space: nowrap;

  &:hover,
  &:focus {
    border-color: oklch(55% 0.17 253);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    outline: 0;
  }

  &:disabled {
    cursor: not-allowed;
    border-color: oklch(87% 0.012 245);
    background: oklch(95% 0.006 245);
    color: oklch(56% 0.014 245);
  }

  @media (max-width: 575.98px) {
    width: 100%;
  }
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const LaunchTableStyled = styled(Table)`
  min-width: 560px;
  margin-bottom: 0;
  border: 1px solid oklch(90% 0.008 245);
  border-radius: 8px;
  overflow: hidden;

  thead th {
    padding: 0.78rem 0.85rem;
    border-bottom: 1px solid oklch(90% 0.008 245);
    background: oklch(96% 0.006 245);
    color: oklch(31% 0.018 245);
    font-size: 0.84rem;
    font-weight: 760;
    white-space: nowrap;
  }

  tbody td {
    padding: 0.78rem 0.85rem;
    border-bottom: 1px solid oklch(93% 0.006 245);
    background: oklch(99% 0.004 245);
    color: oklch(28% 0.016 245);
    font-size: 0.9rem;
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }
`;

const IconAction = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid
    ${({ $variant }) =>
      $variant === "danger" ? "oklch(82% 0.09 25)" : "oklch(86% 0.012 245)"};
  border-radius: 9px;
  background: oklch(99% 0.004 245);
  color: ${({ $variant }) =>
    $variant === "danger" ? "oklch(50% 0.18 25)" : "oklch(38% 0.018 245)"};

  &:hover,
  &:focus {
    background: ${({ $variant }) =>
      $variant === "danger" ? "oklch(96% 0.018 25)" : "oklch(96% 0.006 245)"};
    outline: 0;
  }
`;

const EmptyLaunchCell = styled.td`
  padding: 18px !important;
  color: oklch(49% 0.018 245) !important;
  text-align: center;
`;

const InlineConfirm = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  border: 1px solid oklch(86% 0.04 35);
  border-radius: 8px;
  background: oklch(97% 0.018 35);

  @media (max-width: 575.98px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const ConfirmText = styled.p`
  margin: 0;
  color: oklch(36% 0.05 35);
  font-size: 0.92rem;
  font-weight: 650;
`;

const ConfirmActions = styled.div`
  display: inline-flex;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: 575.98px) {
    width: 100%;
  }
`;

const smallButtonStyles = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 0.86rem;
  font-weight: 760;
`;

const SecondarySmallButton = styled.button`
  ${smallButtonStyles}
  border: 1px solid oklch(82% 0.012 245);
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);
`;

const DangerSmallButton = styled.button`
  ${smallButtonStyles}
  border: 1px solid oklch(76% 0.11 25);
  background: oklch(48% 0.18 25);
  color: oklch(98% 0.004 240);
`;

const TotalsRow = styled.p`
  margin: 12px 0 0;
  color: oklch(39% 0.018 245);
  font-size: 0.94rem;
  text-align: right;
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

const SecondaryAction = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 20px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);
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

const PrimaryAction = styled.button`
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
