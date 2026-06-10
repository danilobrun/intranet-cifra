export const getWeatherRecommendation = ({ current, hourly = [], daily }) => {
  const nextRainChance = Math.max(
    ...hourly
      .slice(0, 6)
      .map((hour) => hour.precipitationProbability)
      .filter((value) => typeof value === "number"),
    0,
  );

  if (nextRainChance >= 60) {
    return "Leve guarda-chuva se sair nas próximas horas.";
  }

  if (current?.temperature >= 32 || daily?.maxTemperature >= 33) {
    return "Dia quente, mantenha-se hidratado.";
  }

  if (current?.windGusts >= 45 || current?.windSpeed >= 35) {
    return "Atenção ao vento mais forte ao longo do dia.";
  }

  if (current?.weatherCode === 45 || current?.weatherCode === 48) {
    return "Neblina presente, redobre a atenção em deslocamentos.";
  }

  return "Condições estáveis para acompanhar a rotina do dia.";
};
