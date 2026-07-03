import { useMemo, useRef, useState } from "react";
import { Alert, Button, Modal, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faEye,
  faFileCsv,
  faRotateLeft,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import {
  importarFuncionarios,
  previewImportacaoFuncionarios,
} from "../../services/Funcionarios.service";

const actionLabels = {
  create: "Criar",
  update: "Atualizar",
  error: "Erro",
};

const getImportErrorMessage = (error) => {
  const data = error?.data || {};

  if (Array.isArray(data.missingColumns) && data.missingColumns.length) {
    return `CSV sem colunas obrigatórias: ${data.missingColumns.join(", ")}.`;
  }

  return (
    error?.message ||
    "Não foi possível processar o arquivo CSV. Verifique o arquivo e tente novamente."
  );
};

const getSummary = (previewResult) =>
  previewResult?.summary || {
    totalRows: 0,
    validRows: 0,
    createCount: 0,
    updateCount: 0,
    errorCount: 0,
    duplicateCount: 0,
    missingCentroCustoCount: 0,
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

export function ImportFuncionariosModal({ show, onHide, onImported }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState();
  const [fileInputKey, setFileInputKey] = useState(0);
  const [previewResult, setPreviewResult] = useState();
  const [successResult, setSuccessResult] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isImportLoading, setIsImportLoading] = useState(false);
  const [shouldCreateMissingCentrosCusto, setShouldCreateMissingCentrosCusto] =
    useState(false);

  const summary = useMemo(() => getSummary(previewResult), [previewResult]);
  const previewRows = Array.isArray(previewResult?.preview)
    ? previewResult.preview
    : [];
  const missingCentrosCusto = Array.isArray(previewResult?.missingCentrosCusto)
    ? previewResult.missingCentrosCusto
    : [];
  const canConfirmImport =
    Boolean(file) &&
    Boolean(previewResult) &&
    !successResult &&
    summary.errorCount === 0 &&
    summary.duplicateCount === 0 &&
    (!missingCentrosCusto.length || shouldCreateMissingCentrosCusto) &&
    !isPreviewLoading &&
    !isImportLoading;
  const isLoading = isPreviewLoading || isImportLoading;

  const resetImportState = () => {
    setFile(undefined);
    setPreviewResult(undefined);
    setSuccessResult(undefined);
    setErrorMessage("");
    setShouldCreateMissingCentrosCusto(false);
    setFileInputKey((currentKey) => currentKey + 1);
  };

  const handleHide = () => {
    if (isLoading) {
      return;
    }

    resetImportState();
    onHide();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setFile(selectedFile);
    setPreviewResult(undefined);
    setSuccessResult(undefined);
    setErrorMessage("");
    setShouldCreateMissingCentrosCusto(false);
  };

  const handleClearFile = () => {
    if (isLoading) {
      return;
    }

    resetImportState();
    fileInputRef.current?.focus();
  };

  const handlePreview = async () => {
    if (!file) {
      setErrorMessage("Selecione um arquivo CSV antes de gerar a pré-visualização.");
      return;
    }

    try {
      setIsPreviewLoading(true);
      setErrorMessage("");
      setSuccessResult(undefined);
      setShouldCreateMissingCentrosCusto(false);

      const result = await previewImportacaoFuncionarios(file);
      setPreviewResult(result);
    } catch (error) {
      setPreviewResult(error?.data?.preview ? error.data : undefined);
      setErrorMessage(getImportErrorMessage(error));
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!canConfirmImport) {
      return;
    }

    try {
      setIsImportLoading(true);
      setErrorMessage("");

      const result = await importarFuncionarios(file, {
        criarCentrosCustoInexistentes: shouldCreateMissingCentrosCusto
          ? "true"
          : "",
      });
      setSuccessResult(result);
      await onImported();
    } catch (error) {
      setPreviewResult(error?.data?.preview ? error.data : previewResult);
      setErrorMessage(getImportErrorMessage(error));
    } finally {
      setIsImportLoading(false);
    }
  };

  return (
    <ImportModal show={show} onHide={handleHide} size="xl" centered>
      <Modal.Header closeButton={!isLoading}>
        <TitleBlock>
          <Modal.Title>Importar funcionários por CSV</Modal.Title>
          <TitleDescription>
            A pré-visualização não grava dados. A importação só será feita após
            confirmação.
          </TitleDescription>
        </TitleBlock>
      </Modal.Header>

      <ImportBody>
        <IntroPanel>
          <IntroText>
            Envie um arquivo CSV contendo as colunas: <strong>Nome</strong>,{" "}
            <strong>CPF</strong> e <strong>Centro de Custo</strong>.
          </IntroText>
          <ExampleBlock aria-label="Exemplo de CSV">
            Nome;CPF;Centro de Custo{"\n"}
            João Silva;12345678909;OBRA-001{"\n"}
            Maria Souza;98765432100;OBRA-002
          </ExampleBlock>
        </IntroPanel>

        <UploadPanel>
          <FileField>
            <FileLabel htmlFor="funcionarios-import-file">
              Arquivo CSV
            </FileLabel>
            <FileControl
              key={fileInputKey}
              id="funcionarios-import-file"
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              disabled={isLoading}
              onChange={handleFileChange}
            />
          </FileField>

          <SelectedFileInfo>
            <FontAwesomeIcon icon={faFileCsv} />
            {file ? file.name : "Nenhum arquivo selecionado"}
          </SelectedFileInfo>

          <UploadActions>
            <SecondaryButton
              type="button"
              variant="light"
              disabled={!file || isLoading}
              onClick={handleClearFile}
            >
              <FontAwesomeIcon icon={faRotateLeft} />
              Limpar
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={!file || isLoading}
              onClick={handlePreview}
            >
              <FontAwesomeIcon icon={faEye} />
              {isPreviewLoading ? "Gerando pré-visualização..." : "Pré-visualizar"}
            </PrimaryButton>
          </UploadActions>
        </UploadPanel>

        {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : null}

        {successResult ? (
          <Alert variant="success">
            {successResult.message || "Importação concluída com sucesso."}{" "}
            Criados: {successResult.summary?.createdCount || 0}. Atualizados:{" "}
            {successResult.summary?.updatedCount || 0}. Centros de custo
            criados: {successResult.summary?.createdCentroCustoCount || 0}.
          </Alert>
        ) : null}

        {previewResult ? (
          <>
            <SummaryGrid>
              <SummaryCard>
                <SummaryLabel>Total de linhas</SummaryLabel>
                <SummaryValue>{summary.totalRows}</SummaryValue>
              </SummaryCard>
              <SummaryCard>
                <SummaryLabel>Linhas válidas</SummaryLabel>
                <SummaryValue>{summary.validRows}</SummaryValue>
              </SummaryCard>
              <SummaryCard>
                <SummaryLabel>Serão criados</SummaryLabel>
                <SummaryValue>{summary.createCount}</SummaryValue>
              </SummaryCard>
              <SummaryCard>
                <SummaryLabel>Serão atualizados</SummaryLabel>
                <SummaryValue>{summary.updateCount}</SummaryValue>
              </SummaryCard>
              <SummaryCard $tone={summary.errorCount ? "danger" : "default"}>
                <SummaryLabel>Com erro</SummaryLabel>
                <SummaryValue>{summary.errorCount}</SummaryValue>
              </SummaryCard>
              <SummaryCard
                $tone={summary.duplicateCount ? "danger" : "default"}
              >
                <SummaryLabel>CPFs duplicados</SummaryLabel>
                <SummaryValue>{summary.duplicateCount}</SummaryValue>
              </SummaryCard>
              <SummaryCard
                $tone={summary.missingCentroCustoCount ? "warning" : "default"}
              >
                <SummaryLabel>Centros novos</SummaryLabel>
                <SummaryValue>{summary.missingCentroCustoCount || 0}</SummaryValue>
              </SummaryCard>
            </SummaryGrid>

            {summary.errorCount || summary.duplicateCount ? (
              <Alert variant="warning">
                Corrija os erros do CSV e gere uma nova pré-visualização antes de
                confirmar a importação.
              </Alert>
            ) : missingCentrosCusto.length ? (
              <Alert variant="warning">
                <MissingTitle>
                  O CSV possui centro(s) de custo ainda não cadastrado(s).
                </MissingTitle>
                <MissingList>
                  {missingCentrosCusto.map((centroCusto) => (
                    <li key={centroCusto}>{centroCusto}</li>
                  ))}
                </MissingList>
                <ConfirmMissingLabel>
                  <ConfirmMissingInput
                    type="checkbox"
                    checked={shouldCreateMissingCentrosCusto}
                    disabled={isLoading}
                    onChange={(event) =>
                      setShouldCreateMissingCentrosCusto(event.target.checked)
                    }
                  />
                  Confirmo a criação dos centros de custo inexistentes ao
                  importar.
                </ConfirmMissingLabel>
              </Alert>
            ) : (
              <Alert variant="info">
                Pré-visualização validada. Você pode confirmar a importação para gravar
                os dados.
              </Alert>
            )}

            <PreviewTableCard>
              <PreviewTableScroll>
                <PreviewTable>
                  <colgroup>
                    <col style={{ width: "78px" }} />
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "150px" }} />
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "130px" }} />
                    <col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Linha</th>
                      <th>Nome</th>
                      <th>CPF</th>
                      <th>Centro de custo</th>
                      <th>Ação</th>
                      <th>Erros</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.length ? (
                      previewRows.map((row) => {
                        const hasErrors = row.errors?.length > 0;

                        return (
                          <tr key={`${row.row}-${row.cpf || row.nome}`}>
                            <td>{row.row}</td>
                            <td>{row.nome || "-"}</td>
                            <td>{formatCpf(row.cpf)}</td>
                            <td>{row.centroCusto || "-"}</td>
                            <td>
                              <ActionBadge $status={row.action}>
                                {actionLabels[row.action] || "Erro"}
                              </ActionBadge>
                            </td>
                            <td>
                              {hasErrors ? (
                                <ErrorList>
                                  {row.errors.map((error) => (
                                    <li key={`${row.row}-${error}`}>
                                      {error}
                                    </li>
                                  ))}
                                </ErrorList>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <EmptyCell colSpan={6}>
                          Nenhuma linha encontrada na pré-visualização.
                        </EmptyCell>
                      </tr>
                    )}
                  </tbody>
                </PreviewTable>
              </PreviewTableScroll>
            </PreviewTableCard>
          </>
        ) : null}
      </ImportBody>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleHide} disabled={isLoading}>
          Fechar
        </Button>
        <ConfirmButton
          type="button"
          disabled={!canConfirmImport}
          onClick={handleConfirmImport}
        >
          <FontAwesomeIcon icon={isImportLoading ? faUpload : faCheck} />
          {isImportLoading ? "Importando..." : "Confirmar importação"}
        </ConfirmButton>
      </Modal.Footer>
    </ImportModal>
  );
}

const ImportModal = styled(Modal)`
  .modal-content {
    overflow: hidden;
    border: 1px solid oklch(89% 0.009 245);
    border-radius: 14px;
    background: oklch(99% 0.004 245);
    box-shadow: 0 22px 54px oklch(22% 0.018 245 / 0.18);
  }

  .modal-header {
    align-items: flex-start;
    border-bottom: 1px solid oklch(90% 0.008 245);
    background: oklch(99% 0.004 245);
  }
`;

const TitleBlock = styled.div`
  display: grid;
  gap: 5px;
`;

const TitleDescription = styled.p`
  margin: 0;
  color: oklch(49% 0.018 245);
  font-size: 0.92rem;
  line-height: 1.4;
`;

const ImportBody = styled(Modal.Body)`
  display: grid;
  gap: 16px;
  max-height: min(74vh, 760px);
  overflow-y: auto;
  padding: 18px;
  background: oklch(98.5% 0.004 245);
`;

const IntroPanel = styled.section`
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
`;

const IntroText = styled.p`
  margin: 0;
  color: oklch(28% 0.016 245);
  font-size: 0.95rem;
  line-height: 1.5;
`;

const ExampleBlock = styled.pre`
  margin: 0;
  padding: 12px;
  border: 1px solid oklch(88% 0.012 245);
  border-radius: 8px;
  background: oklch(97% 0.004 245);
  color: oklch(28% 0.016 245);
  font-size: 0.86rem;
  line-height: 1.45;
  overflow-x: auto;
  white-space: pre;
`;

const UploadPanel = styled.section`
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(180px, auto) auto;
  gap: 14px;
  align-items: end;
  padding: 14px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);

  @media (max-width: 991.98px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
`;

const FileField = styled.div`
  display: grid;
  min-width: 0;
  gap: 7px;
`;

const FileLabel = styled.label`
  margin: 0;
  color: oklch(31% 0.018 245);
  font-size: 0.88rem;
  font-weight: 700;
`;

const FileControl = styled.input`
  width: 100%;
  min-height: 42px;
  padding: 8px 12px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 8px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
`;

const SelectedFileInfo = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  min-width: 0;
  color: oklch(36% 0.018 245);
  font-size: 0.9rem;
  font-weight: 650;
  overflow-wrap: anywhere;
`;

const UploadActions = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`;

const actionButtonStyles = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 9px;
  font-weight: 720;
`;

const SecondaryButton = styled(Button)`
  ${actionButtonStyles}
  border: 1px solid oklch(86% 0.012 245);
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
  }
`;

const PrimaryButton = styled.button`
  ${actionButtonStyles}
  border: 0;
  background-color: oklch(54% 0.19 253);
  color: oklch(98% 0.004 240);

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    background-color: oklch(48% 0.2 253);
  }

  &:disabled {
    cursor: not-allowed;
    background-color: oklch(68% 0.06 250);
  }
`;

const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;

  @media (max-width: 575.98px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 12px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === "danger"
        ? "oklch(84% 0.06 25)"
        : $tone === "warning"
          ? "oklch(84% 0.08 78)"
          : "oklch(89% 0.009 245)"};
  border-radius: 8px;
  background: ${({ $tone }) =>
    $tone === "danger"
      ? "oklch(97% 0.018 25)"
      : $tone === "warning"
        ? "oklch(97% 0.026 78)"
        : "oklch(99% 0.004 245)"};
`;

const SummaryLabel = styled.span`
  color: oklch(49% 0.018 245);
  font-size: 0.76rem;
  font-weight: 760;
  text-transform: uppercase;
`;

const SummaryValue = styled.strong`
  color: oklch(24% 0.018 245);
  font-size: 1.25rem;
  font-weight: 780;
`;

const PreviewTableCard = styled.section`
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
  overflow: hidden;
`;

const PreviewTableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const PreviewTable = styled(Table)`
  min-width: 920px;
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;

  thead th {
    padding: 0.82rem 0.75rem;
    border: 0;
    background: oklch(55% 0.012 245);
    color: oklch(98% 0.004 245);
    font-size: 0.8rem;
    font-weight: 760;
    white-space: nowrap;
  }

  tbody td {
    padding: 0.78rem 0.75rem;
    border-top: 0;
    border-bottom: 1px solid oklch(93% 0.006 245);
    color: oklch(28% 0.016 245);
    font-size: 0.86rem;
    vertical-align: top;
    overflow-wrap: break-word;
    word-break: normal;
  }

  thead th:nth-child(5),
  tbody td:nth-child(5) {
    text-align: center;
    white-space: nowrap;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }
`;

const ActionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 25px;
  padding: 0 9px;
  border: 1px solid
    ${({ $status }) =>
      $status === "error" ? "oklch(84% 0.06 25)" : "oklch(83% 0.04 253)"};
  border-radius: 999px;
  background: ${({ $status }) =>
    $status === "error" ? "oklch(97% 0.018 25)" : "oklch(97% 0.014 253)"};
  color: ${({ $status }) =>
    $status === "error" ? "oklch(45% 0.16 25)" : "oklch(36% 0.12 253)"};
  font-size: 0.78rem;
  font-weight: 780;
  line-height: 1;
  white-space: nowrap;
`;

const ErrorList = styled.ul`
  display: grid;
  gap: 3px;
  margin: 0;
  padding-left: 18px;
  color: oklch(45% 0.16 25);
`;

const MissingTitle = styled.strong`
  display: block;
  margin-bottom: 8px;
`;

const MissingList = styled.ul`
  display: grid;
  gap: 4px;
  margin: 0 0 12px;
  padding-left: 18px;
`;

const ConfirmMissingLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  font-weight: 650;
`;

const ConfirmMissingInput = styled.input`
  flex: 0 0 auto;
  margin-top: 4px;
`;

const EmptyCell = styled.td`
  padding: 24px !important;
  color: oklch(49% 0.018 245) !important;
  text-align: center;
`;

const ConfirmButton = styled.button`
  ${actionButtonStyles}
  border: 0;
  background-color: oklch(54% 0.19 253);
  color: oklch(98% 0.004 240);

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    background-color: oklch(48% 0.2 253);
  }

  &:disabled {
    cursor: not-allowed;
    background-color: oklch(68% 0.06 250);
  }
`;
