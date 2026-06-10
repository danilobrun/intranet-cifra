import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileInvoiceDollar,
  faSackDollar,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { formatCurrency } from "./utils";

const SUMMARY_ITEMS = [
  {
    key: "saldo",
    label: "Saldo",
    icon: faWallet,
    tone: "saldo",
  },
  {
    key: "bm",
    label: "BM",
    icon: faFileInvoiceDollar,
    tone: "bm",
  },
  {
    key: "orcamento",
    label: "Orçamento",
    icon: faSackDollar,
    tone: "orcamento",
  },
];

const toneColors = {
  saldo: {
    border: "oklch(86% 0.055 152)",
    background: "oklch(97.5% 0.018 152)",
    iconBackground: "oklch(94.5% 0.035 152)",
    color: "oklch(38% 0.12 152)",
  },
  bm: {
    border: "oklch(88% 0.045 25)",
    background: "oklch(97.5% 0.014 25)",
    iconBackground: "oklch(95% 0.026 25)",
    color: "oklch(44% 0.13 25)",
  },
  orcamento: {
    border: "oklch(87% 0.05 253)",
    background: "oklch(97.5% 0.016 253)",
    iconBackground: "oklch(94.5% 0.034 253)",
    color: "oklch(45% 0.16 253)",
  },
};

const getToneColor = (tone, key, fallback) =>
  toneColors[tone]?.[key] || fallback;

export function ResumoContratosSummaryCards({
  cards,
  ariaLabel = "Resumo de contratos",
}) {
  return (
    <SummaryPanel aria-label={ariaLabel}>
      <SummaryGrid>
        {SUMMARY_ITEMS.map((item) => (
          <SummaryItem key={item.key} $tone={item.tone}>
            <SummaryIcon $tone={item.tone}>
              <FontAwesomeIcon icon={item.icon} />
            </SummaryIcon>
            <SummaryText>
              <SummaryLabel $tone={item.tone}>{item.label}</SummaryLabel>
              <SummaryValue $tone={item.tone}>
                {formatCurrency(cards?.[item.key])}
              </SummaryValue>
            </SummaryText>
          </SummaryItem>
        ))}
      </SummaryGrid>
    </SummaryPanel>
  );
}

const SummaryPanel = styled.section`
  display: grid;
  gap: 10px;
  margin: 18px 0;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 12px;

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryItem = styled.article`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  gap: 12px;
  min-height: 92px;
  padding: 17px 18px;
  border: 1px solid oklch(89% 0.009 245);
  border-color: ${({ $tone }) =>
    getToneColor($tone, "border", "oklch(89% 0.009 245)")};
  border-radius: 8px;
  background: ${({ $tone }) =>
    getToneColor($tone, "background", "oklch(99% 0.004 245)")};
  box-shadow: 0 8px 18px oklch(22% 0.018 245 / 0.045);
`;

const SummaryIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 42px;
  order: 2;
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: ${({ $tone }) =>
    getToneColor($tone, "iconBackground", "oklch(96% 0.006 245)")};
  color: ${({ $tone }) =>
    getToneColor($tone, "color", "oklch(39% 0.018 245)")};
  font-size: 1.05rem;
`;

const SummaryText = styled.div`
  min-width: 0;
`;

const SummaryLabel = styled.span`
  display: block;
  color: ${({ $tone }) =>
    getToneColor($tone, "color", "oklch(49% 0.018 245)")};
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.2;
  text-transform: uppercase;
`;

const SummaryValue = styled.strong`
  display: block;
  margin-top: 8px;
  color: ${({ $tone }) =>
    getToneColor($tone, "color", "oklch(24% 0.018 245)")};
  font-size: 1.62rem;
  font-weight: 820;
  line-height: 1.2;
  overflow-wrap: anywhere;

  @media (max-width: 1199.98px) {
    font-size: 1.44rem;
  }

  @media (max-width: 575.98px) {
    font-size: 1.28rem;
  }
`;
