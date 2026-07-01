import styled from "styled-components";

export function MovimentacaoStatusBadge({ status }) {
  return (
    <StatusBadge $status={status}>
      {status || "-"}
    </StatusBadge>
  );
}

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 9px;
  border: 1px solid
    ${({ $status }) =>
      $status === "Aplicado na Folha"
        ? "oklch(79% 0.08 152)"
        : "oklch(84% 0.08 78)"};
  border-radius: 999px;
  background: ${({ $status }) =>
    $status === "Aplicado na Folha"
      ? "oklch(96% 0.03 152)"
      : "oklch(96% 0.035 78)"};
  color: ${({ $status }) =>
    $status === "Aplicado na Folha"
      ? "oklch(36% 0.1 152)"
      : "oklch(39% 0.085 70)"};
  font-size: 0.82rem;
  font-weight: 760;
  white-space: nowrap;
`;
