import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import styled from "styled-components";
import {
  RESUMO_CONTRATO_MONTH_OPTIONS,
  formatCurrencyInputValue,
  getResumoContratoId,
  getResumoContratoName,
  parseCurrencyInput,
} from "./utils";

const getInitialForm = (ano) => ({
  contratoId: "",
  mes: "1",
  ano: String(ano),
  valorBm: "",
});

export function LancarBmModal({
  show,
  selectedYear,
  contratos = [],
  isSubmiting = false,
  onHide,
  onSubmit,
}) {
  const [formData, setFormData] = useState(getInitialForm(selectedYear));
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (show) {
      setFormData(getInitialForm(selectedYear));
      setErrorMsg("");
    }
  }, [show, selectedYear]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === "valorBm" ? formatCurrencyInputValue(value) : value;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const valorBm = parseCurrencyInput(formData.valorBm);
    const ano = Number(formData.ano);
    const mes = Number(formData.mes);

    if (!formData.contratoId) {
      setErrorMsg("Selecione um contrato.");
      return;
    }

    if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
      setErrorMsg("Selecione um mês válido.");
      return;
    }

    if (!Number.isInteger(ano) || ano <= 0) {
      setErrorMsg("Informe um ano válido.");
      return;
    }

    if (!Number.isFinite(valorBm) || valorBm <= 0) {
      setErrorMsg("Informe um valor de BM maior que zero.");
      return;
    }

    setErrorMsg("");
    await onSubmit({
      contratoId: formData.contratoId,
      mes,
      ano,
      valorBm,
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Lançar BM</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FieldsGrid>
            <Form.Group controlId="resumo-contrato-bm-contrato">
              <Form.Label>Contrato</Form.Label>
              <Form.Select
                name="contratoId"
                value={formData.contratoId}
                onChange={handleChange}
                disabled={isSubmiting || !contratos.length}
              >
                <option value="">Selecione</option>
                {contratos.map((contrato) => {
                  const contratoId = getResumoContratoId(contrato);

                  return (
                    <option key={contratoId} value={contratoId}>
                      {getResumoContratoName(contrato)}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>

            <InlineFields>
              <Form.Group controlId="resumo-contrato-bm-mes">
                <Form.Label>Mês</Form.Label>
                <Form.Select
                  name="mes"
                  value={formData.mes}
                  onChange={handleChange}
                  disabled={isSubmiting}
                >
                  {RESUMO_CONTRATO_MONTH_OPTIONS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group controlId="resumo-contrato-bm-ano">
                <Form.Label>Ano</Form.Label>
                <Form.Control
                  type="number"
                  name="ano"
                  value={formData.ano}
                  min="2000"
                  inputMode="numeric"
                  onChange={handleChange}
                  disabled={isSubmiting}
                />
              </Form.Group>
            </InlineFields>

            <Form.Group controlId="resumo-contrato-bm-valor">
              <Form.Label>Valor BM</Form.Label>
              <Form.Control
                type="text"
                name="valorBm"
                value={formData.valorBm}
                placeholder="R$ 0,00"
                inputMode="decimal"
                onChange={handleChange}
                disabled={isSubmiting}
              />
            </Form.Group>
          </FieldsGrid>

          {errorMsg ? <ErrorText>{errorMsg}</ErrorText> : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmiting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmiting}>
            {isSubmiting ? "Lançando..." : "Lançar BM"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

const FieldsGrid = styled.div`
  display: grid;
  gap: 14px;
`;

const InlineFields = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px;
  gap: 12px;

  @media (max-width: 479.98px) {
    grid-template-columns: 1fr;
  }
`;

const ErrorText = styled.p`
  margin: 12px 0 0;
  color: oklch(45% 0.18 25);
  font-size: 0.92rem;
  font-weight: 650;
`;
