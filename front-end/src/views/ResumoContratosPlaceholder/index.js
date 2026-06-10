import { Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";

export function ResumoContratosPlaceholderView({ title, description }) {
  return (
    <LayoutPortal>
      <PortalHeader title={title} description={description} />
      <Alert variant="info">
        Esta etapa ainda será implementada. A visão macro de Resumo Contratos já
        está disponível.
      </Alert>
      <BackLink to="/resumo-contratos">Voltar para Resumo Contratos</BackLink>
    </LayoutPortal>
  );
}

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 9px 16px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    text-decoration: none;
  }
`;
