export const DEFAULT_WEATHER_LOCATION = {
  id: "default-maceio",
  name: "Maceió",
  admin1: "Alagoas",
  admin2: "Maceió",
  countryCode: "BR",
  latitude: -9.66583,
  longitude: -35.73528,
  timezone: "America/Maceio",
};

const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

const currentVariables = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "precipitation",
  "weather_code",
  "cloud_cover",
  "pressure_msl",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "visibility",
];

const hourlyVariables = [
  "temperature_2m",
  "apparent_temperature",
  "precipitation_probability",
  "weather_code",
  "wind_speed_10m",
];

const dailyVariables = [
  "temperature_2m_max",
  "temperature_2m_min",
  "sunrise",
  "sunset",
  "weather_code",
];

const normalizeLocation = (location) => ({
  id: location.id,
  name: location.name,
  admin1: location.admin1,
  admin2: location.admin2,
  countryCode: location.country_code || location.countryCode,
  latitude: location.latitude,
  longitude: location.longitude,
  timezone: location.timezone,
});

export const searchBrazilCities = async (cityName) => {
  const query = cityName.trim();

  if (query.length < 2) {
    return [];
  }

  const searchParams = new URLSearchParams({
    name: query,
    count: "8",
    language: "pt",
    countryCode: "BR",
  });

  const response = await fetch(`${GEOCODING_API_URL}?${searchParams}`);

  if (!response.ok) {
    throw new Error("Falha ao buscar cidades.");
  }

  const data = await response.json();
  return (data.results || []).map(normalizeLocation);
};

export const getWeatherByCoordinates = async ({ latitude, longitude }) => {
  const searchParams = new URLSearchParams({
    latitude,
    longitude,
    current: currentVariables.join(","),
    hourly: hourlyVariables.join(","),
    daily: dailyVariables.join(","),
    forecast_days: "1",
    forecast_hours: "12",
    timezone: "auto",
  });

  const response = await fetch(`${WEATHER_API_URL}?${searchParams}`);

  if (!response.ok) {
    throw new Error("Falha ao buscar dados do clima.");
  }

  return response.json();
};
