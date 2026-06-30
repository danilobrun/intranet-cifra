const { getMissingSmtpEnvKeys, sendMail } = require("./mail.service");

const parseBooleanEnv = (value) => String(value).toLowerCase() === "true";

const getPlateNotificationRecipients = () =>
  String(process.env.PLATE_MOVEMENT_EMAIL_TO || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const isPlateMovementEmailEnabled = () =>
  parseBooleanEnv(process.env.PLATE_MOVEMENT_EMAIL_ENABLED);

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (value instanceof Date) return value.toISOString();

  return String(value);
};

const formatChangedAt = (value) => {
  const date = value ? new Date(value) : new Date();

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
};

const getActionLabel = (action) => {
  const labels = {
    CREATE: "Cadastro",
    UPDATE: "Atualização",
    DELETE: "Inativação",
    RESTORE: "Reativação",
  };

  return labels[action] || action;
};

const getChangedByLabel = (changedBy) => {
  if (!changedBy) return "Usuário não identificado";

  if (changedBy.name && changedBy.email) {
    return `${changedBy.name} (${changedBy.email})`;
  }

  return changedBy.name || changedBy.email || String(changedBy);
};

const buildPlateMovementEmail = (movement) => {
  const placa = movement.placa || "Placa";
  const actionLabel = getActionLabel(movement.action);
  const subject = `Movimentação de placa - ${placa}`;
  const changedBy = getChangedByLabel(movement.changedBy);
  const changedAt = formatChangedAt(movement.changedAt);
  const changes = Array.isArray(movement.changes) ? movement.changes : [];
  const changesText = changes.length
    ? changes.map(
        (change) =>
          `- ${change.field}: ${formatValue(change.from)} -> ${formatValue(change.to)}`,
      )
    : ["- Sem alterações detalhadas."];
  const changesHtml = changes.length
    ? changes
        .map(
          (change) => `
            <tr>
              <td style="padding:12px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#1f2937;">${escapeHtml(change.field)}</td>
              <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#4b5563;">${escapeHtml(formatValue(change.from))}</td>
              <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#4b5563;">${escapeHtml(formatValue(change.to))}</td>
            </tr>
          `,
        )
        .join("")
    : `
      <tr>
        <td colspan="3" style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Sem alterações detalhadas.</td>
      </tr>
    `;

  const text = [
    `Placa: ${placa}`,
    `Ação: ${actionLabel}`,
    `Responsável: ${changedBy}`,
    `Data: ${changedAt}`,
    "",
    "Alterações:",
    ...changesText,
  ].join("\n");

  return {
    subject,
    text,
    html: `
      <div style="background:#f4f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#1f2937;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:#ACAEAE;padding:24px 32px;color:#ffffff;">
            <h1 style="margin:0;font-size:24px;">Movimentação de placa</h1>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;">Uma movimentação foi registrada na base de placas da Intranet Cifra.</p>
            <div style="margin:24px 0;padding:18px 24px;background:#f8fafc;border:1px dashed #0b5ed7;border-radius:12px;text-align:center;">
              <span style="display:block;margin:0 0 8px;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;">Placa</span>
              <span style="font-size:32px;font-weight:700;letter-spacing:4px;color:#0b5ed7;">${escapeHtml(placa)}</span>
            </div>
            <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
              <tr>
                <td style="padding:8px 0;color:#6b7280;width:120px;">Ação</td>
                <td style="padding:8px 0;font-weight:700;color:#1f2937;">${escapeHtml(actionLabel)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;width:120px;">Responsável</td>
                <td style="padding:8px 0;font-weight:700;color:#1f2937;">${escapeHtml(changedBy)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;width:120px;">Data</td>
                <td style="padding:8px 0;font-weight:700;color:#1f2937;">${escapeHtml(changedAt)}</td>
              </tr>
            </table>
            <p style="margin:0 0 12px;font-size:16px;font-weight:700;">Alterações</p>
            <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th align="left" style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;">Campo</th>
                  <th align="left" style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;">Anterior</th>
                  <th align="left" style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;">Atual</th>
                </tr>
              </thead>
              <tbody>
                ${changesHtml}
              </tbody>
            </table>
            <p style="margin:24px 0 0;line-height:1.6;color:#6b7280;">
              Esta é uma notificação automática da Intranet Cifra.
            </p>
          </div>
        </div>
      </div>
    `,
  };
};

const notifyPlateMovement = async (movement) => {
  if (!isPlateMovementEmailEnabled()) {
    return { skipped: true, reason: "disabled" };
  }

  const recipients = getPlateNotificationRecipients();
  if (!recipients.length) {
    return { skipped: true, reason: "missing_recipients" };
  }

  const missingSmtpEnvKeys = getMissingSmtpEnvKeys();
  if (missingSmtpEnvKeys.length) {
    return {
      skipped: true,
      reason: "missing_smtp_config",
      missingSmtpEnvKeys,
    };
  }

  const email = buildPlateMovementEmail(movement);

  await sendMail({
    to: recipients.join(","),
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  return { skipped: false };
};

module.exports = {
  buildPlateMovementEmail,
  getPlateNotificationRecipients,
  isPlateMovementEmailEnabled,
  notifyPlateMovement,
};
