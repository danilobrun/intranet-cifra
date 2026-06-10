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
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import {
  getWeatherConditionLabel,
  getWeatherConditionTheme,
  getWeatherConditionType,
} from "../../../helpers/weatherConditionLabels";
import {
  formatLocationName,
  formatTemperature,
  formatUpdatedAt,
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

export function CurrentWeatherSummary({ weather }) {
  const { current, location, updatedAt } = weather;
  const conditionType = getWeatherConditionType(current.weatherCode);
  const conditionLabel = getWeatherConditionLabel(current.weatherCode);
  const conditionTheme = getWeatherConditionTheme(current.weatherCode);

  return (
    <Summary>
      <IconFrame $theme={conditionTheme}>
        <FontAwesomeIcon icon={weatherIcons[conditionType]} aria-hidden="true" />
      </IconFrame>

      <CurrentInfo>
        <LocationLabel>{formatLocationName(location)}</LocationLabel>
        <Temperature>{formatTemperature(current.temperature)}</Temperature>
        <Condition $theme={conditionTheme}>{conditionLabel}</Condition>
        {updatedAt ? (
          <UpdatedAt>Atualizado às {formatUpdatedAt(updatedAt)}</UpdatedAt>
        ) : null}
      </CurrentInfo>
    </Summary>
  );
}

const Summary = styled.section`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 1.25rem;
  min-width: 0;

  @media (max-width: 575px) {
    grid-template-columns: 1fr;
  }
`;

const IconFrame = styled.div`
  width: 6rem;
  height: 6rem;
  display: grid;
  place-items: center;
  border: 1px solid ${({ $theme }) => $theme.border};
  border-radius: 1rem;
  background: ${({ $theme }) => $theme.background};
  color: ${({ $theme }) => $theme.color};
  box-shadow: 0 16px 34px ${({ $theme }) => $theme.shadow};
  font-size: 2.55rem;

  @media (max-width: 575px) {
    width: 5rem;
    height: 5rem;
    font-size: 2.1rem;
  }
`;

const CurrentInfo = styled.div`
  min-width: 0;
`;

const LocationLabel = styled.p`
  margin: 0 0 0.25rem;
  color: oklch(44% 0.018 245);
  font-size: 0.95rem;
  font-weight: 650;
`;

const Temperature = styled.p`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: 4rem;
  font-weight: 650;
  line-height: 1;
  letter-spacing: 0;

  @media (max-width: 575px) {
    font-size: 3rem;
  }
`;

const Condition = styled.p`
  margin: 0.45rem 0 0;
  color: ${({ $theme }) => $theme.color};
  font-size: 1.05rem;
  font-weight: 650;
`;

const UpdatedAt = styled.p`
  margin: 0.25rem 0 0;
  color: oklch(52% 0.016 245);
  font-size: 0.9rem;
`;
