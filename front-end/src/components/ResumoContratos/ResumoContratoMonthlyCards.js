import styled from "styled-components";
import {
  RESUMO_CONTRATO_MONTH_OPTIONS,
  formatCurrency,
  toNumber,
} from "./utils";

export function ResumoContratoMonthlyCards({ bmsPorMes }) {
  return (
    <MonthlySection>
      <SectionTitle>BM mensal do contrato</SectionTitle>

      <MonthsGrid>
        {RESUMO_CONTRATO_MONTH_OPTIONS.map((month) => {
          const value = toNumber(bmsPorMes?.[String(month.value)]);
          const hasBm = value > 0;

          return (
            <MonthCard key={month.value} $hasBm={hasBm}>
              <MonthName>{month.label}</MonthName>
              <MonthValue $hasBm={hasBm}>{formatCurrency(value)}</MonthValue>
              <StatusLine $hasBm={hasBm}>
                <StatusDot $hasBm={hasBm} />
                {hasBm ? "Com BM" : "Sem lançamento"}
              </StatusLine>
            </MonthCard>
          );
        })}
      </MonthsGrid>
    </MonthlySection>
  );
}

const MonthlySection = styled.section`
  display: grid;
  gap: 12px;
  margin-top: 18px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: 1.08rem;
  font-weight: 760;
  line-height: 1.25;
`;

const MonthsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1199.98px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 479.98px) {
    grid-template-columns: 1fr;
  }
`;

const MonthCard = styled.article`
  display: grid;
  min-width: 0;
  gap: 6px;
  min-height: 104px;
  padding: 15px 16px;
  border: 1px solid
    ${({ $hasBm }) =>
      $hasBm ? "oklch(86% 0.055 152)" : "oklch(89% 0.009 245)"};
  border-radius: 8px;
  background: ${({ $hasBm }) =>
    $hasBm ? "oklch(97.5% 0.018 152)" : "oklch(99% 0.004 245)"};
  box-shadow: 0 8px 18px oklch(22% 0.018 245 / 0.045);
`;

const MonthName = styled.span`
  color: oklch(28% 0.016 245);
  font-size: 0.86rem;
  font-weight: 760;
  line-height: 1.2;
`;

const MonthValue = styled.strong`
  color: ${({ $hasBm }) =>
    $hasBm ? "oklch(35% 0.1 152)" : "oklch(30% 0.016 245)"};
  font-size: 1.04rem;
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
`;

const StatusLine = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: ${({ $hasBm }) =>
    $hasBm ? "oklch(40% 0.08 152)" : "oklch(50% 0.014 245)"};
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.2;
`;

const StatusDot = styled.span`
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: ${({ $hasBm }) =>
    $hasBm ? "oklch(62% 0.13 152)" : "oklch(70% 0.012 245)"};
`;
