import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_WEATHER_LOCATION,
  getWeatherByCoordinates,
  searchBrazilCities,
} from "../../../../services/Weather.service";
import { getWeatherRecommendation } from "../../../../helpers/weatherRecommendations";

const getBrowserPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unavailable."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 10 * 60 * 1000,
      timeout: 12000,
    });
  });

const buildBrowserLocation = (position) => ({
  id: "browser-location",
  name: "Sua localização atual",
  countryCode: "BR",
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
});

const mapHourlyForecast = (hourly = {}, currentTime) => {
  const times = hourly.time || [];
  const currentDate = currentTime ? new Date(currentTime) : new Date();
  const startIndex = Math.max(
    times.findIndex((time) => new Date(time) >= currentDate),
    0,
  );

  return times.slice(startIndex, startIndex + 8).map((time, index) => {
    const sourceIndex = startIndex + index;

    return {
      time,
      temperature: hourly.temperature_2m?.[sourceIndex],
      apparentTemperature: hourly.apparent_temperature?.[sourceIndex],
      precipitationProbability:
        hourly.precipitation_probability?.[sourceIndex],
      weatherCode: hourly.weather_code?.[sourceIndex],
      windSpeed: hourly.wind_speed_10m?.[sourceIndex],
    };
  });
};

const mapWeatherData = (apiData, location) => {
  const current = apiData.current || {};
  const hourly = mapHourlyForecast(apiData.hourly, current.time);
  const dailySource = apiData.daily || {};
  const daily = {
    maxTemperature: dailySource.temperature_2m_max?.[0],
    minTemperature: dailySource.temperature_2m_min?.[0],
    sunrise: dailySource.sunrise?.[0],
    sunset: dailySource.sunset?.[0],
    weatherCode: dailySource.weather_code?.[0],
  };

  const mappedCurrent = {
    time: current.time,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    precipitation: current.precipitation,
    weatherCode: current.weather_code,
    cloudCover: current.cloud_cover,
    pressure: current.pressure_msl,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    windGusts: current.wind_gusts_10m,
    visibility: current.visibility,
    rainChance: hourly[0]?.precipitationProbability,
  };

  return {
    location,
    current: mappedCurrent,
    hourly,
    daily,
    recommendation: getWeatherRecommendation({
      current: mappedCurrent,
      hourly,
      daily,
    }),
    updatedAt: new Date(),
  };
};

const getGeolocationErrorMessage = (error) => {
  if (error?.code === 1) {
    return "Permissão de localização negada. Você ainda pode pesquisar uma cidade do Brasil.";
  }

  if (error?.code === 2) {
    return "Não foi possível identificar sua localização. Pesquise uma cidade para consultar o clima.";
  }

  if (error?.code === 3) {
    return "A localização demorou para responder. Tente novamente ou pesquise uma cidade.";
  }

  return "Seu navegador não permite buscar a localização atual.";
};

const getInitialWeatherErrorMessage = (error) =>
  error?.code
    ? getGeolocationErrorMessage(error)
    : "Não foi possível carregar o clima pela sua localização.";

export function useDashboardWeather() {
  const [weather, setWeather] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(
    DEFAULT_WEATHER_LOCATION,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadWeather = useCallback(async (location) => {
    const weatherData = await getWeatherByCoordinates(location);
    const mappedWeather = mapWeatherData(weatherData, location);

    setSelectedLocation(location);
    setWeather(mappedWeather);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDefaultWeatherAfterInitialError = async (message) => {
      try {
        const weatherData = await getWeatherByCoordinates(
          DEFAULT_WEATHER_LOCATION,
        );

        if (!isMounted) {
          return;
        }

        setSelectedLocation(DEFAULT_WEATHER_LOCATION);
        setWeather(mapWeatherData(weatherData, DEFAULT_WEATHER_LOCATION));
        setErrorMessage(`${message} Exibindo clima padrão de Maceió.`);
      } catch {
        if (isMounted) {
          setErrorMessage(
            "Não foi possível carregar o clima pela sua localização. Tente pesquisar uma cidade.",
          );
        }
      }
    };

    const fetchInitialWeather = async () => {
      try {
        setLoading(true);
        setIsDetectingLocation(true);
        setErrorMessage("");
        const position = await getBrowserPosition();
        const location = buildBrowserLocation(position);
        const weatherData = await getWeatherByCoordinates(location);

        if (!isMounted) {
          return;
        }

        setSelectedLocation(location);
        setWeather(mapWeatherData(weatherData, location));
      } catch (error) {
        if (isMounted) {
          await loadDefaultWeatherAfterInitialError(
            getInitialWeatherErrorMessage(error),
          );
        }
      } finally {
        if (isMounted) {
          setIsDetectingLocation(false);
          setLoading(false);
        }
      }
    };

    fetchInitialWeather();

    return () => {
      isMounted = false;
    };
  }, []);

  const searchCityWeather = async (cityName) => {
    const query = cityName.trim();

    if (!query) {
      setErrorMessage("Informe uma cidade para buscar o clima.");
      return;
    }

    try {
      setIsSearching(true);
      setErrorMessage("");
      const cities = await searchBrazilCities(query);

      if (!cities.length) {
        setErrorMessage("Nenhuma cidade brasileira foi encontrada com esse nome.");
        return;
      }

      await loadWeather(cities[0]);
      setSearchTerm("");
    } catch {
      setErrorMessage("Falha ao buscar o clima da cidade informada.");
    } finally {
      setIsSearching(false);
    }
  };

  const useCurrentLocationWeather = async () => {
    try {
      setIsDetectingLocation(true);
      setErrorMessage("");
      const position = await getBrowserPosition();
      const location = buildBrowserLocation(position);

      await loadWeather(location);
    } catch (error) {
      setErrorMessage(getGeolocationErrorMessage(error));
    } finally {
      setIsDetectingLocation(false);
    }
  };

  return {
    weather,
    selectedLocation,
    searchTerm,
    setSearchTerm,
    loading,
    isSearching,
    isDetectingLocation,
    errorMessage,
    searchCityWeather,
    useCurrentLocationWeather,
  };
}
