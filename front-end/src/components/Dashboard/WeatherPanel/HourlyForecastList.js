import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faCloud,
  faCloudRain,
  faCloudShowersHeavy,
  faCloudSun,
  faSmog,
  faSnowflake,
  faSun,
  faWind,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import {
  getWeatherConditionTheme,
  getWeatherConditionType,
} from "../../../helpers/weatherConditionLabels";
import {
  formatHour,
  formatPercent,
  formatTemperature,
  formatWindSpeed,
} from "../../../helpers/weatherFormatters";

const weatherIcons = {
  clear: faSun,
  partlyCloudy: faCloudSun,
  cloudy: faCloud,
  fog: faSmog,
  drizzle: faCloudRain,
  rain: faCloudRain,
  showers: faCloudShowersHeavy,
  snow: faSnowflake,
  thunderstorm: faBolt,
  unknown: faCloudSun,
};

export function HourlyForecastList({ hourly }) {
  if (!hourly?.length) {
    return null;
  }

  return (
    <Section aria-labelledby="hourly-forecast-title">
      <SectionTitle id="hourly-forecast-title">Próximas horas</SectionTitle>
      <ForecastStrip>
        {hourly.map((hour) => {
          const conditionType = getWeatherConditionType(hour.weatherCode);
          const conditionTheme = getWeatherConditionTheme(hour.weatherCode);

          return (
            <ForecastItem key={hour.time} $theme={conditionTheme}>
              <ForecastTime>{formatHour(hour.time)}</ForecastTime>
              <ForecastIcon $theme={conditionTheme}>
                <FontAwesomeIcon
                  icon={weatherIcons[conditionType]}
                  aria-hidden="true"
                />
              </ForecastIcon>
              <ForecastTemperature>
                {formatTemperature(hour.temperature)}
              </ForecastTemperature>
              <ForecastMeta>
                <span>{formatPercent(hour.precipitationProbability)} chuva</span>
                <span>
                  <FontAwesomeIcon icon={faWind} aria-hidden="true" />
                  {formatWindSpeed(hour.windSpeed)}
                </span>
              </ForecastMeta>
            </ForecastItem>
          );
        })}
      </ForecastStrip>
    </Section>
  );
}

const Section = styled.section`
  display: grid;
  gap: 0.75rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: oklch(25% 0.018 245);
  font-size: 1.15rem;
  font-weight: 700;
`;

const ForecastStrip = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(8.5rem, 1fr);
  gap: 0.6rem;
  overflow-x: auto;
  padding-bottom: 0.15rem;
`;

const ForecastItem = styled.article`
  min-width: 0;
  display: grid;
  gap: 0.45rem;
  padding: 0.9rem;
  border: 1px solid ${({ $theme }) => $theme.border};
  border-radius: 0.5rem;
  background:
    linear-gradient(
      180deg,
      ${({ $theme }) => $theme.background} 0%,
      oklch(99% 0.004 245) 88%
    );
`;

const ForecastTime = styled.span`
  color: oklch(48% 0.016 245);
  font-size: 0.85rem;
  font-weight: 700;
`;

const ForecastIcon = styled.span`
  width: 2rem;
  height: 2rem;
  display: inline-grid;
  place-items: center;
  border-radius: 0.45rem;
  background: oklch(99% 0.004 245 / 0.82);
  color: ${({ $theme }) => $theme.color};
  box-shadow: inset 0 0 0 1px ${({ $theme }) => $theme.border};
`;

const ForecastTemperature = styled.strong`
  color: oklch(23% 0.018 245);
  font-size: 1.35rem;
  line-height: 1;
`;

const ForecastMeta = styled.span`
  display: grid;
  gap: 0.2rem;
  color: oklch(51% 0.016 245);
  font-size: 0.82rem;
  line-height: 1.35;

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    white-space: nowrap;
  }
`;
