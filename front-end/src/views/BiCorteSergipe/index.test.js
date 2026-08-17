import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BiCorteSergipeView, BI_CORTE_SERGIPE_URL } from ".";

jest.mock("../../components/LayoutPortal", () => ({
  LayoutPortal: ({ children }) => <div>{children}</div>,
}));

jest.mock("react-markdown", () => ({ children }) => (
  <>{String(children).replace(/\*\*/g, "")}</>
));

const mockedQuestionsAndAnswers = [
  [
    "Quantas OS foram geradas para a Cifra?",
    "O total de OS geradas para a Cifra é 26.678.",
  ],
  ["Quantas OS concluídas?", "O total de OS concluídas é 23.320."],
  ["Quantas OS não concluídas?", "O total de OS não concluídas é 3.358."],
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
];

const attentionTeams = [
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
];
const lowRoutingTeams = ["802", "210", "310"];
const relinkingTeams = ["479", "481"];

const teamPerformanceQuestionsAndAnswers = [
  ...attentionTeams.map((team) => [
    team,
    `A equipe ${team} merece atenção, pois apresenta uma produção significativamente abaixo do esperado. Segundo informações dos coordenadores da Cifra, isso pode estar relacionado a uma equipe desligada ou ao uso de um login provisório.`,
  ]),
  ...lowRoutingTeams.map((team) => [
    team,
    `A equipe ${team} recebeu poucas ordens de serviço no período, o que explica seu baixo volume de produção. Apesar disso, concluiu 100% das OS que foram roteirizadas.`,
  ]),
  ...relinkingTeams.map((team) => [
    team,
    `A equipe ${team} alcançou 100% de execução nas religações, mas apresenta um desempenho menor em serviços de supressão. Para aproveitar melhor seu desempenho, recomenda-se priorizá-la nas atividades de religação.`,
  ]),
];

const limitMessage =
  "O assistente atingiu o limite de consultas gratuitas por enquanto. Tente novamente mais tarde.";

const submitQuestion = (question) => {
  fireEvent.change(screen.getByLabelText("Digite sua pergunta"), {
    target: { value: question },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
};

const finishThinking = async (milliseconds = 2000) => {
  await act(async () => {
    jest.advanceTimersByTime(milliseconds);
    await Promise.resolve();
  });
};

describe("BiCorteSergipeView", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("renderiza o iframe correto e remove o skeleton apos carregar", () => {
    render(<BiCorteSergipeView />);

    const iframe = screen.getByTitle("BI Corte Sergipe");
    expect(iframe).toHaveAttribute("src", BI_CORTE_SERGIPE_URL);
    expect(iframe).toHaveAttribute("allowfullscreen");
    expect(
      screen.getByLabelText("Carregando BI Corte Sergipe"),
    ).toBeInTheDocument();

    fireEvent.load(iframe);

    expect(
      screen.queryByLabelText("Carregando BI Corte Sergipe"),
    ).not.toBeInTheDocument();
  });

  it("mantem o assistente visivel ao lado do relatorio", () => {
    render(<BiCorteSergipeView />);

    expect(screen.getByText(/Sou o assistente do BI Corte Sergipe/)).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Fechar assistente do BI" }),
    ).not.toBeInTheDocument();
  });

  it("oferece a pergunta de OS geradas como recomendacao", () => {
    render(<BiCorteSergipeView />);

    const recommendedQuestion = screen.getByRole("button", {
      name: "Quantas OS foram geradas para a Cifra?",
    });

    fireEvent.click(recommendedQuestion);

    expect(screen.getByLabelText("Digite sua pergunta")).toHaveValue(
      "Quantas OS foram geradas para a Cifra?",
    );
  });

  it.each(mockedQuestionsAndAnswers)(
    "responde a pergunta mockada: %s",
    async (question, answer) => {
      jest.useFakeTimers();
      render(<BiCorteSergipeView />);

      submitQuestion(question);

      expect(screen.getByText("Analisando o relatório...")).toBeInTheDocument();
      expect(screen.queryByText(answer)).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1999);
      });

      expect(screen.queryByText(answer)).not.toBeInTheDocument();

      await finishThinking(1);

      expect(screen.getByText(answer)).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    },
  );

  it("normaliza maiusculas, acentos, espacos e pontuacao", async () => {
    jest.useFakeTimers();
    render(<BiCorteSergipeView />);

    submitQuestion("  QUANTAS   os CONCLUIDAS!!!  ");
    await finishThinking();

    expect(
      screen.getByText("O total de OS concluídas é 23.320."),
    ).toBeInTheDocument();
  });

  it.each(teamPerformanceQuestionsAndAnswers)(
    "responde sobre a performance da equipe %s",
    async (team, answer) => {
      jest.useFakeTimers();
      render(<BiCorteSergipeView />);

      submitQuestion(`Fale sobre a performance da equipe ${team}`);
      await finishThinking();

      expect(screen.getByText(answer)).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    },
  );

  it("aceita o codigo SER da equipe somente dentro da pergunta completa", async () => {
    jest.useFakeTimers();
    render(<BiCorteSergipeView />);

    submitQuestion("Fale sobre a performance da equipe ser479t");
    await finishThinking();

    expect(
      screen.getByText(
        "A equipe 479 alcançou 100% de execução nas religações, mas apresenta um desempenho menor em serviços de supressão. Para aproveitar melhor seu desempenho, recomenda-se priorizá-la nas atividades de religação.",
      ),
    ).toBeInTheDocument();
  });

  it.each(["123", "SER123T", "Fale sobre a performance da equipe 999"])(
    "nao responde sobre a equipe sem uma consulta valida: %s",
    async (question) => {
      jest.useFakeTimers();
      render(<BiCorteSergipeView />);

      submitQuestion(question);
      await finishThinking();

      expect(screen.getByText(limitMessage)).toBeInTheDocument();
    },
  );

  it("mostra uma mensagem simples para perguntas fora do mock", async () => {
    jest.useFakeTimers();
    render(<BiCorteSergipeView />);

    submitQuestion("Qual equipe teve o melhor resultado?");
    await finishThinking();

    expect(
      screen.getByText(limitMessage),
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("cancela a resposta simulada ao limpar e restaura a recomendacao", async () => {
    jest.useFakeTimers();
    render(<BiCorteSergipeView />);

    submitQuestion("Quantas OS foram geradas para a Cifra?");

    expect(
      screen.queryByRole("button", {
        name: "Quantas OS foram geradas para a Cifra?",
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Limpar conversa" }));
    await finishThinking();

    expect(
      screen.getByRole("button", {
        name: "Quantas OS foram geradas para a Cifra?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("O total de OS geradas para a Cifra é 26.678."),
    ).not.toBeInTheDocument();
  });

  it("nao consulta o webhook durante a demonstracao", async () => {
    jest.useFakeTimers();
    render(<BiCorteSergipeView />);

    submitQuestion("Quantas OS foram geradas para a Cifra?");
    await finishThinking();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("esconde a recomendacao depois da primeira pergunta", () => {
    jest.useFakeTimers();
    render(<BiCorteSergipeView />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Quantas OS foram geradas para a Cifra?",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));

    expect(
      screen.queryByRole("button", {
        name: "Quantas OS foram geradas para a Cifra?",
      }),
    ).not.toBeInTheDocument();
  });

  it("exibe alternativas quando o iframe falha", () => {
    jest.useFakeTimers();
    render(<BiCorteSergipeView />);

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(
      screen.getByText("Não foi possível carregar o relatório."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Abrir relatório em nova aba" }),
    ).toHaveAttribute("href", BI_CORTE_SERGIPE_URL);
  });
});
