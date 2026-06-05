import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faTemperatureHalf,
  faUmbrella,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import {
  formatHour,
  formatTemperature,
} from "../../../helpers/weatherFormatters";

const summaryTones = {
  sunrise: {
    background: "oklch(96.5% 0.04 78)",
    border: "oklch(88% 0.07 78)",
    color: "oklch(56% 0.15 68)",
  },
  sunset: {
    background: "oklch(96% 0.035 35)",
    border: "oklch(87% 0.065 35)",
    color: "oklch(52% 0.14 35)",
  },
  max: {
    background: "oklch(96.5% 0.035 72)",
    border: "oklch(88% 0.065 72)",
    color: "oklch(55% 0.15 62)",
  },
  min: {
    background: "oklch(96% 0.03 230)",
    border: "oklch(86% 0.06 230)",
    color: "oklch(47% 0.13 230)",
  },
};

export function DailyWeatherSummary({ daily, recommendation }) {
  const summaryItems = [
    {
      label: "Nascer do sol",
      value: formatHour(daily.sunrise),
      icon: faClock,
      tone: summaryTones.sunrise,
    },
    {
      label: "Pôr do sol",
      value: formatHour(daily.sunset),
      icon: faClock,
      tone: summaryTones.sunset,
    },
    {
      label: "Máxima",
      value: formatTemperature(daily.maxTemperature),
      icon: faTemperatureHalf,
      tone: summaryTones.max,
    },
    {
      label: "Mínima",
      value: formatTemperature(daily.minTemperature),
      icon: faTemperatureHalf,
      tone: summaryTones.min,
    },
  ];

  return (
    <SummarySection aria-labelledby="daily-summary-title">
      <SummaryHeader>
        <SectionTitle id="daily-summary-title">Resumo do dia</SectionTitle>
      </SummaryHeader>

      <SummaryGrid>
        {summaryItems.map((item) => (
          <SummaryItem key={item.label} $tone={item.tone}>
            <SummaryIcon $tone={item.tone}>
              <FontAwesomeIcon icon={item.icon} aria-hidden="true" />
            </SummaryIcon>
            <span>
              <SummaryLabel>{item.label}</SummaryLabel>
              <SummaryValue>{item.value}</SummaryValue>
            </span>
          </SummaryItem>
        ))}
      </SummaryGrid>

      <Recommendation>
        <FontAwesomeIcon icon={faUmbrella} aria-hidden="true" />
        <span>{recommendation}</span>
      </Recommendation>
    </SummarySection>
  );
}

const SummarySection = styled.section`
  display: grid;
  gap: 0.75rem;
`;

const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: oklch(25% 0.018 245);
  font-size: 1.15rem;
  font-weight: 700;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;

  @media (max-width: 991px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 575px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryItem = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.65rem;
  padding: 0.85rem;
  border: 1px solid ${({ $tone }) => $tone.border};
  border-radius: 0.5rem;
  background:
    linear-gradient(
      180deg,
      ${({ $tone }) => $tone.background} 0%,
      oklch(99% 0.004 245) 92%
    );
`;

const SummaryIcon = styled.span`
  width: 2rem;
  height: 2rem;
  display: inline-grid;
  place-items: center;
  border-radius: 0.45rem;
  background: oklch(99% 0.004 245 / 0.82);
  color: ${({ $tone }) => $tone.color};
  box-shadow: inset 0 0 0 1px ${({ $tone }) => $tone.border};
`;

const SummaryLabel = styled.span`
  display: block;
  color: oklch(50% 0.016 245);
  font-size: 0.82rem;
  font-weight: 650;
`;

const SummaryValue = styled.strong`
  display: block;
  color: oklch(25% 0.018 245);
  font-size: 0.98rem;
  font-weight: 700;
`;

const Recommendation = styled.p`
  display: inline-flex;
  align-items: flex-start;
  gap: 0.55rem;
  margin: 0;
  padding: 0.85rem 1rem;
  border: 1px solid oklch(88% 0.012 245);
  border-radius: 0.5rem;
  background: oklch(96.5% 0.026 248);
  color: oklch(32% 0.02 245);
  font-weight: 600;
  line-height: 1.45;

  svg {
    margin-top: 0.2rem;
    color: oklch(45% 0.15 248);
  }
`;
