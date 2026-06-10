import styled from "styled-components";
import { CurrentWeatherSummary } from "./CurrentWeatherSummary";
import { DailyWeatherSummary } from "./DailyWeatherSummary";
import { HourlyForecastList } from "./HourlyForecastList";
import { WeatherMetricGrid } from "./WeatherMetricGrid";
import { WeatherPanelError } from "./WeatherPanelError";
import { WeatherPanelSkeleton } from "./WeatherPanelSkeleton";
import { WeatherSearchForm } from "./WeatherSearchForm";
import { useDashboardWeather } from "./hooks/useDashboardWeather";

export function DashboardWeatherPanel() {
  const {
    weather,
    searchTerm,
    setSearchTerm,
    loading,
    isSearching,
    isDetectingLocation,
    errorMessage,
    searchCityWeather,
    useCurrentLocationWeather,
  } = useDashboardWeather();

  return (
    <Panel aria-labelledby="dashboard-weather-title">
      <PanelHeader>
        <div>
          <PanelEyebrow>Clima da localidade</PanelEyebrow>
          <PanelTitle id="dashboard-weather-title">
            Condições atuais e próximas horas
          </PanelTitle>
        </div>

        <WeatherSearchForm
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearch={searchCityWeather}
          onUseCurrentLocation={useCurrentLocationWeather}
          isSearching={isSearching}
          isDetectingLocation={isDetectingLocation}
        />
      </PanelHeader>

      <PanelContent>
        {errorMessage ? <WeatherPanelError message={errorMessage} /> : null}

        {loading ? (
          <WeatherPanelSkeleton />
        ) : weather ? (
          <>
            <OverviewGrid>
              <CurrentWeatherSummary weather={weather} />
              <WeatherMetricGrid current={weather.current} />
            </OverviewGrid>

            <SectionDivider />

            <HourlyForecastList hourly={weather.hourly} />

            <SectionDivider />

            <DailyWeatherSummary
              daily={weather.daily}
              recommendation={weather.recommendation}
            />
          </>
        ) : (
          <WeatherPanelError message="Pesquise uma cidade do Brasil para consultar o clima." />
        )}
      </PanelContent>

      <Attribution>
        Dados meteorológicos por{" "}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo
        </a>
      </Attribution>
    </Panel>
  );
}

const Panel = styled.section`
  display: grid;
  gap: 1.25rem;
  padding: 1.5rem;
  border: 1px solid oklch(88% 0.01 245);
  border-radius: 0.5rem;
  background: oklch(99% 0.004 245);
  box-shadow: 0 18px 42px oklch(22% 0.018 245 / 0.08);

  @media (max-width: 575px) {
    padding: 1rem;
  }
`;

const PanelHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PanelEyebrow = styled.p`
  margin: 0 0 0.2rem;
  color: oklch(48% 0.016 245);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const PanelTitle = styled.h2`
  margin: 0;
  color: oklch(24% 0.018 245);
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.25;
`;

const PanelContent = styled.div`
  display: grid;
  gap: 1.25rem;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(18rem, 0.85fr) minmax(0, 1.15fr);
  gap: 1.25rem;
  align-items: center;

  @media (max-width: 991px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
`;

const SectionDivider = styled.hr`
  width: 100%;
  margin: 0;
  border: 0;
  border-top: 1px solid oklch(89% 0.01 245);
  opacity: 1;
`;

const Attribution = styled.footer`
  padding-top: 0.75rem;
  border-top: 1px solid oklch(90% 0.01 245);
  color: oklch(52% 0.016 245);
  font-size: 0.85rem;
  text-align: right;

  a {
    color: oklch(43% 0.15 253);
    font-weight: 650;
    text-decoration: none;
  }

  a:hover,
  a:focus {
    text-decoration: underline;
  }

  @media (max-width: 575px) {
    text-align: left;
  }
`;
