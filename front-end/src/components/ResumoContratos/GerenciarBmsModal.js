import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import styled from "styled-components";
import {
  RESUMO_CONTRATO_MONTH_OPTIONS,
  formatCurrency,
  formatCurrencyInputValue,
  parseCurrencyInput,
} from "./utils";

const getInitialFormData = (bmsPorMes = {}) =>
  RESUMO_CONTRATO_MONTH_OPTIONS.reduce((accumulator, month) => {
    const value = bmsPorMes?.[String(month.value)] || 0;
    accumulator[String(month.value)] = formatCurrency(value);
    return accumulator;
  }, {});

export function GerenciarBmsModal({
  show,
  selectedYear,
  bmsPorMes = {},
  isSubmiting = false,
  onHide,
  onSubmit,
}) {
  const [formData, setFormData] = useState(() => getInitialFormData(bmsPorMes));
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (show) {
      setFormData(getInitialFormData(bmsPorMes));
      setErrorMsg("");
    }
  }, [bmsPorMes, show]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: formatCurrencyInputValue(value),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextBmsPorMes = {};

    for (const month of RESUMO_CONTRATO_MONTH_OPTIONS) {
      const key = String(month.value);
      const parsedValue = parseCurrencyInput(formData[key]);

      if (!Number.isFinite(parsedValue)) {
        setErrorMsg(`Valor inválido em ${month.label}.`);
        return;
      }

      nextBmsPorMes[key] = parsedValue;
    }

    setErrorMsg("");
    await onSubmit({
      ano: selectedYear,
      bmsPorMes: nextBmsPorMes,
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Gerenciar BMs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ModalDescription>
            Informe os valores de BM para cada mês do ano selecionado.
          </ModalDescription>
          <YearBadge>Ano: {selectedYear}</YearBadge>

          <MonthsGrid>
            {RESUMO_CONTRATO_MONTH_OPTIONS.map((month) => (
              <Form.Group
                key={month.value}
                controlId={`resumo-contrato-bm-month-${month.value}`}
              >
                <Form.Label>{month.label}</Form.Label>
                <Form.Control
                  type="text"
                  name={String(month.value)}
                  value={formData[String(month.value)] || ""}
                  placeholder="R$ 0,00"
                  inputMode="decimal"
                  onChange={handleChange}
                  disabled={isSubmiting}
                />
              </Form.Group>
            ))}
          </MonthsGrid>

          {errorMsg ? <ErrorText>{errorMsg}</ErrorText> : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmiting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmiting}>
            {isSubmiting ? "Salvando..." : "Salvar BMs"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

const ModalDescription = styled.p`
  margin: 0;
  color: oklch(45% 0.018 245);
  line-height: 1.45;
`;

const YearBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  margin-top: 10px;
  padding: 0 10px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 999px;
  background: oklch(97% 0.006 245);
  color: oklch(31% 0.018 245);
  font-size: 0.86rem;
  font-weight: 700;
`;

const MonthsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;

  label {
    margin-bottom: 6px;
    color: oklch(28% 0.016 245);
    font-size: 0.88rem;
    font-weight: 700;
  }

  input {
    min-height: 42px;
    border: 1px solid oklch(87% 0.014 245);
    border-radius: 8px;
    background-color: oklch(99% 0.004 240);
    color: oklch(22% 0.018 245);
  }

  input:focus {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.12);
  }

  @media (max-width: 767.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

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
