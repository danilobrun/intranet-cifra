import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDroplet,
  faEye,
  faGaugeHigh,
  faTemperatureHalf,
  faUmbrella,
  faWind,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import {
  formatPercent,
  formatPressure,
  formatTemperature,
  formatVisibility,
  formatWindSpeed,
} from "../../../helpers/weatherFormatters";

const metricTones = {
  temperature: {
    background: "oklch(96.5% 0.035 72)",
    border: "oklch(88% 0.065 72)",
    color: "oklch(55% 0.15 62)",
  },
  humidity: {
    background: "oklch(96% 0.03 210)",
    border: "oklch(86% 0.06 210)",
    color: "oklch(48% 0.13 210)",
  },
  wind: {
    background: "oklch(96% 0.026 225)",
    border: "oklch(86% 0.055 225)",
    color: "oklch(47% 0.12 225)",
  },
  rain: {
    background: "oklch(95.5% 0.034 248)",
    border: "oklch(84% 0.072 248)",
    color: "oklch(45% 0.15 248)",
  },
  pressure: {
    background: "oklch(96% 0.03 285)",
    border: "oklch(86% 0.06 285)",
    color: "oklch(45% 0.13 285)",
  },
  visibility: {
    background: "oklch(96.5% 0.032 155)",
    border: "oklch(86% 0.06 155)",
    color: "oklch(45% 0.12 155)",
  },
};

export function WeatherMetricGrid({ current }) {
  const metrics = [
    {
      label: "Sensação térmica",
      value: formatTemperature(current.apparentTemperature),
      icon: faTemperatureHalf,
      tone: metricTones.temperature,
    },
    {
      label: "Umidade",
      value: formatPercent(current.humidity),
      icon: faDroplet,
      tone: metricTones.humidity,
    },
    {
      label: "Vento",
      value: formatWindSpeed(current.windSpeed),
      icon: faWind,
      tone: metricTones.wind,
    },
    {
      label: "Chance de chuva",
      value: formatPercent(current.rainChance),
      icon: faUmbrella,
      tone: metricTones.rain,
    },
    {
      label: "Pressão",
      value: formatPressure(current.pressure),
      icon: faGaugeHigh,
      tone: metricTones.pressure,
    },
    {
      label: "Visibilidade",
      value: formatVisibility(current.visibility),
      icon: faEye,
      tone: metricTones.visibility,
    },
  ];

  return (
    <MetricGrid aria-label="Detalhes do clima atual">
      {metrics.map((metric) => (
        <MetricItem key={metric.label} $tone={metric.tone}>
          <MetricIcon $tone={metric.tone}>
            <FontAwesomeIcon icon={metric.icon} aria-hidden="true" />
          </MetricIcon>
          <MetricText>
            <MetricLabel>{metric.label}</MetricLabel>
            <MetricValue>{metric.value}</MetricValue>
          </MetricText>
        </MetricItem>
      ))}
    </MetricGrid>
  );
}

const MetricGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 991px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 575px) {
    grid-template-columns: 1fr;
  }
`;

const MetricItem = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
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

const MetricIcon = styled.span`
  width: 2.25rem;
  height: 2.25rem;
  display: inline-grid;
  place-items: center;
  border-radius: 0.5rem;
  background: oklch(99% 0.004 245 / 0.82);
  color: ${({ $tone }) => $tone.color};
  box-shadow: inset 0 0 0 1px ${({ $tone }) => $tone.border};
`;

const MetricText = styled.span`
  min-width: 0;
`;

const MetricLabel = styled.span`
  display: block;
  color: oklch(50% 0.016 245);
  font-size: 0.82rem;
  font-weight: 650;
`;

const MetricValue = styled.strong`
  display: block;
  margin-top: 0.1rem;
  color: oklch(25% 0.018 245);
  font-size: 1rem;
  font-weight: 700;
`;
