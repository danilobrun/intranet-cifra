export const escapeCsvCell = (value) => {
  const text = String(value ?? "");
  const safeText = /^[=+\-@]/.test(text.trimStart()) ? `'${text}` : text;
  const escapedText = safeText.replace(/"/g, '""');

  return /[";\r\n]/.test(escapedText) ? `"${escapedText}"` : escapedText;
};

export const buildCsvContent = (rows) =>
  `\uFEFF${rows
    .map((row) => row.map(escapeCsvCell).join(";"))
    .join("\r\n")}`;

export const normalizeCsvFileName = (value, fallback = "exportacao") => {
  const normalizedValue = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return normalizedValue || fallback;
};

export const downloadCsv = (fileName, rows) => {
  const blob = new Blob([buildCsvContent(rows)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
