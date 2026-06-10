import { Table } from "react-bootstrap";
import styled from "styled-components";
import {
  RESUMO_CONTRATO_MONTH_OPTIONS,
  formatCurrency,
  getResumoContratoName,
} from "./utils";

export function ResumoContratoMonthlyTable({ contrato, bmsPorMes }) {
  const contratoName = getResumoContratoName(contrato);

  return (
    <TableCard>
      <TableScroll>
        <MonthlyTableStyled>
          <colgroup>
            <col style={{ width: "18%" }} />
            {RESUMO_CONTRATO_MONTH_OPTIONS.map((month) => (
              <col key={month.value} style={{ width: "9%" }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th>Contrato</th>
              {RESUMO_CONTRATO_MONTH_OPTIONS.map((month) => (
                <th key={month.value}>BM {month.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <StrongText>{contratoName}</StrongText>
              </td>
              {RESUMO_CONTRATO_MONTH_OPTIONS.map((month) => (
                <td key={month.value}>
                  {formatCurrency(bmsPorMes?.[String(month.value)] || 0)}
                </td>
              ))}
            </tr>
          </tbody>
        </MonthlyTableStyled>
      </TableScroll>
    </TableCard>
  );
}

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

const MonthlyTableStyled = styled(Table)`
  min-width: 1760px;
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;

  thead th {
    padding: 0.92rem 0.78rem;
    border: 0;
    background: linear-gradient(
      180deg,
      oklch(58% 0.012 245),
      oklch(51% 0.014 245)
    );
    color: oklch(98% 0.004 245);
    font-size: 0.8rem;
    font-weight: 760;
    line-height: 1.25;
    white-space: nowrap;
    vertical-align: middle;
  }

  tbody td {
    padding: 0.9rem 0.78rem;
    border-top: 0;
    border-bottom: 1px solid oklch(93% 0.006 245);
    background: oklch(99% 0.004 245);
    color: oklch(28% 0.016 245);
    font-size: 0.88rem;
    vertical-align: middle;
    white-space: nowrap;
  }

  tbody tr:hover td {
    background: oklch(97.5% 0.006 245);
  }

  @media (max-width: 575.98px) {
    min-width: 1580px;

    thead th,
    tbody td {
      padding: 0.75rem;
      font-size: 0.82rem;
    }
  }
`;

const StrongText = styled.span`
  color: oklch(22% 0.018 245);
  font-weight: 700;
`;
