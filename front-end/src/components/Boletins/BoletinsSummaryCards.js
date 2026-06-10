import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleDollarToSlot,
  faClock,
  faFileInvoiceDollar,
  faMoneyBillWave,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

const SUMMARY_ITEMS = [
  {
    key: "valorTotalBm",
    label: "Valor total BM",
    icon: faFileInvoiceDollar,
  },
  {
    key: "valorFaturado",
    label: "Valor faturado",
    icon: faReceipt,
  },
  {
    key: "pendenteFaturamento",
    label: "Pend. Faturamento",
    icon: faClock,
  },
  {
    key: "valorPago",
    label: "Valor pago",
    icon: faMoneyBillWave,
  },
  {
    key: "pendentePagamento",
    label: "Pend. Pagamento",
    icon: faCircleDollarToSlot,
  },
];

const formatCurrency = (value) => {
  if (value === undefined || value === null || value === "") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(0);
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(0);
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
};

const getSummaryValue = (item, summary) => formatCurrency(summary?.[item.key]);

export function BoletinsSummaryCards({ summary }) {
  return (
    <SummaryPanel aria-label="Resumo de boletins">
      <SummaryGrid>
        {SUMMARY_ITEMS.map((item) => (
          <SummaryItem key={item.key}>
            <SummaryIcon>
              <FontAwesomeIcon icon={item.icon} />
            </SummaryIcon>
            <SummaryText>
              <SummaryLabel>{item.label}</SummaryLabel>
              <SummaryValue>{getSummaryValue(item, summary)}</SummaryValue>
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
  grid-template-columns: repeat(5, minmax(150px, 1fr));
  gap: 12px;

  @media (max-width: 1399.98px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 479.98px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryItem = styled.article`
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 12px;
  min-height: 82px;
  padding: 14px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
`;

const SummaryIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: oklch(96% 0.006 245);
  color: oklch(39% 0.018 245);
`;

const SummaryText = styled.div`
  min-width: 0;
`;

const SummaryLabel = styled.span`
  display: block;
  color: oklch(49% 0.018 245);
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
`;

const SummaryValue = styled.strong`
  display: block;
  margin-top: 7px;
  color: oklch(24% 0.018 245);
  font-size: 1.2rem;
  font-weight: 760;
  line-height: 1.2;
  overflow-wrap: anywhere;
`;
