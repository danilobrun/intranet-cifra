const weatherConditionLabels = {
  0: "Céu limpo",
  1: "Predominantemente limpo",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Neblina",
  48: "Neblina com formação de gelo",
  51: "Garoa leve",
  53: "Garoa moderada",
  55: "Garoa intensa",
  56: "Garoa congelante leve",
  57: "Garoa congelante intensa",
  61: "Chuva leve",
  63: "Chuva moderada",
  65: "Chuva forte",
  66: "Chuva congelante leve",
  67: "Chuva congelante forte",
  71: "Neve leve",
  73: "Neve moderada",
  75: "Neve forte",
  77: "Grãos de neve",
  80: "Pancadas de chuva leves",
  81: "Pancadas de chuva moderadas",
  82: "Pancadas de chuva fortes",
  85: "Pancadas de neve leves",
  86: "Pancadas de neve fortes",
  95: "Trovoadas",
  96: "Trovoadas com granizo leve",
  99: "Trovoadas com granizo forte",
};

export const getWeatherConditionLabel = (weatherCode) =>
  weatherConditionLabels[weatherCode] || "Condição não informada";

export const getWeatherConditionType = (weatherCode) => {
  if ([0, 1].includes(weatherCode)) {
    return "clear";
  }

  if (weatherCode === 2) {
    return "partlyCloudy";
  }

  if (weatherCode === 3) {
    return "cloudy";
  }

  if ([45, 48].includes(weatherCode)) {
    return "fog";
  }

  if ([51, 53, 55, 56, 57].includes(weatherCode)) {
    return "drizzle";
  }

  if ([61, 63, 65, 66, 67].includes(weatherCode)) {
    return "rain";
  }

  if ([80, 81, 82].includes(weatherCode)) {
    return "showers";
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return "snow";
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return "thunderstorm";
  }

  return "unknown";
};

const weatherConditionThemes = {
  clear: {
    background: "oklch(96.5% 0.045 82)",
    border: "oklch(88% 0.075 82)",
    color: "oklch(58% 0.16 72)",
    shadow: "oklch(66% 0.13 72 / 0.18)",
  },
  partlyCloudy: {
    background: "oklch(96.5% 0.034 90)",
    border: "oklch(88% 0.055 90)",
    color: "oklch(55% 0.13 78)",
    shadow: "oklch(64% 0.11 78 / 0.16)",
  },
  cloudy: {
    background: "oklch(95.5% 0.015 245)",
    border: "oklch(86% 0.025 245)",
    color: "oklch(45% 0.05 245)",
    shadow: "oklch(45% 0.04 245 / 0.12)",
  },
  fog: {
    background: "oklch(96% 0.014 210)",
    border: "oklch(86% 0.03 210)",
    color: "oklch(47% 0.07 210)",
    shadow: "oklch(47% 0.05 210 / 0.12)",
  },
  drizzle: {
    background: "oklch(96% 0.026 230)",
    border: "oklch(86% 0.055 230)",
    color: "oklch(49% 0.12 230)",
    shadow: "oklch(49% 0.1 230 / 0.14)",
  },
  rain: {
    background: "oklch(95.5% 0.034 248)",
    border: "oklch(84% 0.072 248)",
    color: "oklch(45% 0.15 248)",
    shadow: "oklch(45% 0.13 248 / 0.16)",
  },
  showers: {
    background: "oklch(95% 0.04 255)",
    border: "oklch(83% 0.08 255)",
    color: "oklch(43% 0.17 255)",
    shadow: "oklch(43% 0.14 255 / 0.17)",
  },
  snow: {
    background: "oklch(96.5% 0.025 205)",
    border: "oklch(86% 0.055 205)",
    color: "oklch(47% 0.11 205)",
    shadow: "oklch(47% 0.09 205 / 0.14)",
  },
  thunderstorm: {
    background: "oklch(95% 0.035 292)",
    border: "oklch(84% 0.07 292)",
    color: "oklch(44% 0.15 292)",
    shadow: "oklch(44% 0.13 292 / 0.16)",
  },
  unknown: {
    background: "oklch(96% 0.012 245)",
    border: "oklch(87% 0.018 245)",
    color: "oklch(45% 0.055 245)",
    shadow: "oklch(45% 0.04 245 / 0.12)",
  },
};

export const getWeatherConditionTheme = (weatherCode) =>
  weatherConditionThemes[getWeatherConditionType(weatherCode)] ||
  weatherConditionThemes.unknown;
