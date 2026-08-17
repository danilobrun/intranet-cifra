export const BI_CORTE_SERGIPE_MOCK_DELAY_MS = 2000;

export const BI_CORTE_SERGIPE_RECOMMENDED_QUESTIONS = [
  "Quantas OS foram geradas para a Cifra?",
];

export const BI_CORTE_SERGIPE_LIMIT_MESSAGE =
  "O assistente atingiu o limite de consultas gratuitas por enquanto. Tente novamente mais tarde.";

const normalizeQuestion = (question) =>
  question
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const mockedAnswers = new Map(
  [
    [
      "Quantas OS foram geradas para a Cifra?",
      "O total de OS geradas para a Cifra é 26.678.",
    ],
    ["Quantas OS concluídas?", "O total de OS concluídas é 23.320."],
    [
      "Quantas OS não concluídas?",
      "O total de OS não concluídas é 3.358.",
    ],
    [
      "Qual percentual de OS executadas no prazo?",
      "Cerca de 47,14% das OS foram executadas no prazo.",
    ],
    [
      "Quantas religações executadas no ciclo?",
      "No ciclo de julho (10/07/2026 a 08/08/2026), foram executadas 10.942 religações.",
    ],
    [
      "Qual ciclo está carregado na base?",
      "Está carregado o ciclo de julho, de 10/07/2026 a 08/08/2026.",
    ],
    [
      "Qual o dia que tivemos mais OS executadas e porque?",
      "No dia 31 de julho de 2026 (sexta-feira), foram executadas 1.294 OS. A média de execução neste ciclo é de aproximadamente 926 OS por dia. O volume acima da média ocorreu porque houve mais religações que o normal: foram executadas cerca de 1.261 religações, enquanto a média diária do ciclo é de 418.",
    ],
    [
      "Quantas suspensões foram geradas nesse ciclo?",
      "- Total de OS: 15.284\n- Total concluídas: 11.926\n- Não concluídas: 3.358\n- Conclusão: 78,03%",
    ],
    [
      "Quantas religações foram geradas nesse ciclo?",
      "- Total de OS: 10.942\n- Total concluídas: 10.942\n- Não concluídas: 0\n- Conclusão: 100%",
    ],
    [
      "Quantas substituição foram geradas nesse ciclo?",
      "- Total de OS: 426\n- Total concluídas: 426\n- Não concluídas: 0\n- Conclusão: 100%",
    ],
    [
      "Quantas supressão foram geradas nesse ciclo?",
      "- Total de OS: 13\n- Total concluídas: 13\n- Não concluídas: 0\n- Conclusão: 100%",
    ],
  ].map(([question, answer]) => [normalizeQuestion(question), answer]),
);

const attentionTeams = new Set([
  "123",
  "291",
  "112",
  "294",
  "121",
  "318",
  "137",
  "576",
  "273",
  "805",
  "514",
  "116",
  "498",
  "794",
  "864",
  "803",
]);
const lowRoutingTeams = new Set(["802", "210", "310"]);
const relinkingTeams = new Set(["479", "481"]);

const getTeamNumber = (question) => {
  const match = question.match(
    /^fale sobre a performance da equipe (?:(\d+)|ser(\d+)t)$/,
  );

  return match?.[1] || match?.[2] || null;
};

const getTeamPerformanceAnswer = (question) => {
  const team = getTeamNumber(question);

  if (attentionTeams.has(team)) {
    return `A equipe ${team} merece atenção, pois apresenta uma produção significativamente abaixo do esperado. Segundo informações dos coordenadores da Cifra, isso pode estar relacionado a uma equipe desligada ou ao uso de um login provisório.`;
  }

  if (lowRoutingTeams.has(team)) {
    return `A equipe ${team} recebeu poucas ordens de serviço no período, o que explica seu baixo volume de produção. Apesar disso, concluiu 100% das OS que foram roteirizadas.`;
  }

  if (relinkingTeams.has(team)) {
    return `A equipe ${team} alcançou 100% de execução nas religações, mas apresenta um desempenho menor em serviços de supressão. Para aproveitar melhor seu desempenho, recomenda-se priorizá-la nas atividades de religação.`;
  }

  return null;
};

const createAbortError = () => {
  const error = new Error("Resposta simulada cancelada.");
  error.name = "AbortError";
  return error;
};

export const getBiCorteSergipeMockedAnswer = (question, signal) =>
  new Promise((resolve, reject) => {
    let timeoutId;

    const handleAbort = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", handleAbort);
      reject(createAbortError());
    };

    if (signal?.aborted) {
      handleAbort();
      return;
    }

    timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      const normalizedQuestion = normalizeQuestion(question);

      resolve(
        mockedAnswers.get(normalizedQuestion) ||
          getTeamPerformanceAnswer(normalizedQuestion) ||
          BI_CORTE_SERGIPE_LIMIT_MESSAGE,
      );
    }, BI_CORTE_SERGIPE_MOCK_DELAY_MS);

    signal?.addEventListener("abort", handleAbort, { once: true });
  });
