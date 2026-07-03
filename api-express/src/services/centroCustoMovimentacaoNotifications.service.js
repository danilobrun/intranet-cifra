const { getMissingSmtpEnvKeys, sendMail } = require("./mail.service");

const MOVIMENTACOES_RH_PATH = "/portal/centro-custo/movimentacoes";

const getRhMovimentacaoRecipients = () =>
  String(process.env.RH_MOVIMENTACAO_EMAIL || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatCpf = (value = "") => {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length !== 11) {
    return value || "-";
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9,
  )}-${digits.slice(9)}`;
};

const formatDate = (value, includeTime = false) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    ...(includeTime ? { timeStyle: "short" } : {}),
    timeZone: includeTime ? "America/Sao_Paulo" : "UTC",
  }).format(date);
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
};

const getUserLabel = (user) => {
  if (!user) return "Usuário não identificado";

  if (user.name && user.email) {
    return `${user.name} (${user.email})`;
  }

  return user.name || user.email || String(user);
};

const getMovimentacoesRhUrl = () => {
  const frontendUrl = String(process.env.FRONTEND_URL || "").trim();

  if (!frontendUrl) {
    return "";
  }

  return `${frontendUrl.replace(/\/+$/, "")}${MOVIMENTACOES_RH_PATH}`;
};

const buildCentroCustoMovimentacaoEmail = (movimentacao) => {
  const movimentacoesRhUrl = getMovimentacoesRhUrl();
  const nome = formatValue(movimentacao.nome);
  const cpf = formatCpf(movimentacao.cpf);
  const centroCustoAnterior = formatValue(movimentacao.centroCustoAnterior);
  const novoCentroCusto = formatValue(movimentacao.novoCentroCusto);
  const dataAlteracao = formatDate(movimentacao.dataAlteracao);
  const registradoPor = getUserLabel(movimentacao.createdBy);
  const registradoEm = formatDate(movimentacao.createdAt, true);
  const observacao = formatValue(movimentacao.observacao);
  const subject = "Nova movimentação de centro de custo registrada";
  const linkText = movimentacoesRhUrl
    ? `Link: ${movimentacoesRhUrl}`
    : "Link da tela de Movimentações RH não configurado.";

  const text = [
    "Uma nova movimentação de centro de custo foi registrada na intranet.",
    "",
    `Funcionário: ${nome}`,
    `CPF: ${cpf}`,
    `Centro de Custo Anterior: ${centroCustoAnterior}`,
    `Novo Centro de Custo: ${novoCentroCusto}`,
    `Data da Alteração: ${dataAlteracao}`,
    `Registrado por: ${registradoPor}`,
    `Registrado em: ${registradoEm}`,
    "",
    "Observação:",
    observacao,
    "",
    "Acesse a tela de Movimentações RH para conferir e, após atualizar a folha, marcar como Aplicado na Folha.",
    linkText,
  ].join("\n");

  const detailsRows = [
    ["Funcionário", nome],
    ["CPF", cpf],
    ["Centro de Custo Anterior", centroCustoAnterior],
    ["Novo Centro de Custo", novoCentroCusto],
    ["Data da Alteração", dataAlteracao],
    ["Registrado por", registradoPor],
    ["Registrado em", registradoEm],
  ]
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 0;color:#6b7280;width:190px;">${escapeHtml(
            label,
          )}</td>
          <td style="padding:10px 0;font-weight:700;color:#1f2937;">${escapeHtml(
            value,
          )}</td>
        </tr>
      `,
    )
    .join("");

  return {
    subject,
    text,
    html: `
      <div style="background:#f4f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#1f2937;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:#4b5563;padding:24px 32px;color:#ffffff;">
            <h1 style="margin:0;font-size:22px;line-height:1.3;">Nova movimentação de centro de custo</h1>
          </div>
          <div style="padding:30px 32px;">
            <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">
              Uma nova movimentação de centro de custo foi registrada na intranet e aguarda conferência do RH.
            </p>

            <table style="width:100%;border-collapse:collapse;margin:0 0 22px;">
              <tbody>
                ${detailsRows}
              </tbody>
            </table>

            <div style="margin:22px 0;padding:16px 18px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;">
                Observação
              </p>
              <p style="margin:0;line-height:1.6;color:#1f2937;white-space:pre-wrap;">${escapeHtml(
                observacao,
              )}</p>
            </div>

            ${
              movimentacoesRhUrl
                ? `<p style="margin:26px 0 0;">
                    <a href="${escapeHtml(
                      movimentacoesRhUrl,
                    )}" style="display:inline-block;background:#0d6efd;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px;">
                      Acessar Movimentações RH
                    </a>
                  </p>`
                : ""
            }

            <p style="margin:26px 0 0;line-height:1.6;color:#6b7280;">
              Após atualizar a folha, acesse a intranet e marque a movimentação como Aplicado na Folha.
            </p>
            <p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:#9ca3af;">
              Esta é uma notificação automática da Intranet Cifra.
            </p>
          </div>
        </div>
      </div>
    `,
  };
};

const notifyNovaCentroCustoMovimentacao = async (movimentacao) => {
  const recipients = getRhMovimentacaoRecipients();

  if (!recipients.length) {
    console.log(
      "notifyNovaCentroCustoMovimentacao skipped",
      "missing_recipients",
    );
    return { skipped: true, reason: "missing_recipients" };
  }

  const missingSmtpEnvKeys = getMissingSmtpEnvKeys();

  if (missingSmtpEnvKeys.length) {
    console.log("notifyNovaCentroCustoMovimentacao skipped", {
      reason: "missing_smtp_config",
      missingSmtpEnvKeys,
    });

    return {
      skipped: true,
      reason: "missing_smtp_config",
      missingSmtpEnvKeys,
    };
  }

  const email = buildCentroCustoMovimentacaoEmail(movimentacao);

  await sendMail({
    to: recipients.join(","),
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  return { skipped: false };
};

module.exports = {
  buildCentroCustoMovimentacaoEmail,
  getRhMovimentacaoRecipients,
  notifyNovaCentroCustoMovimentacao,
};
