import { apiUrl, getAuthorizationHeaders } from "./Api.service";
import { removeStorageItem } from "./Storage.service";

const redirectToLoginIfUnauthorized = (response) => {
  if (response.status !== 401) {
    return false;
  }

  alert("Acesso expirado, favor efetuar login novamente!");
  removeStorageItem("user");
  window.location.href = "https://intranet-cifra.netlify.app/";

  return true;
};

const buildUrlWithQuery = (path, query = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.append(key, value);
  });

  const queryString = searchParams.toString();

  return `${apiUrl}${path}${queryString ? `?${queryString}` : ""}`;
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthorizationHeaders(),
      ...options.headers,
    },
  });

  if (redirectToLoginIfUnauthorized(response)) {
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.msg || "Response not ok.");
    error.data = data;
    throw error;
  }

  return data;
};

const getFileNameFromContentDisposition = (contentDisposition = "") => {
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/"/g, ""));
  }

  const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

  return fileNameMatch?.[1];
};

const downloadBlob = (blob, fileName) => {
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

const requestBlob = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthorizationHeaders(),
      ...options.headers,
    },
  });

  if (redirectToLoginIfUnauthorized(response)) {
    return;
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : {};
    const error = new Error(
      data.msg || "Não foi possível baixar o arquivo CSV.",
    );

    error.data = data;
    throw error;
  }

  return {
    blob: await response.blob(),
    fileName: getFileNameFromContentDisposition(
      response.headers.get("content-disposition") || "",
    ),
  };
};

export const getFuncionarios = async (filters = {}) => {
  return requestJson(buildUrlWithQuery("/funcionarios", filters));
};

export const getFuncionarioById = async (funcionarioId) => {
  return requestJson(`${apiUrl}/funcionarios/${funcionarioId}`);
};

export const getFuncionariosCentrosCusto = async () => {
  return requestJson(`${apiUrl}/funcionarios/centros-custo`);
};

export const createFuncionario = async (funcionarioData) => {
  return requestJson(`${apiUrl}/funcionarios`, {
    method: "POST",
    body: JSON.stringify(funcionarioData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const updateFuncionario = async (funcionarioId, funcionarioData) => {
  return requestJson(`${apiUrl}/funcionarios/${funcionarioId}`, {
    method: "PATCH",
    body: JSON.stringify(funcionarioData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const inactivateFuncionario = async (funcionarioId) => {
  return requestJson(`${apiUrl}/funcionarios/${funcionarioId}/inativar`, {
    method: "PATCH",
  });
};

export const exportarFuncionarios = async (filters = {}) => {
  const result = await requestBlob(
    buildUrlWithQuery("/funcionarios/exportar", filters),
  );

  if (!result) {
    return;
  }

  downloadBlob(result.blob, result.fileName || "funcionarios-centro-custo.csv");
};

const buildImportFormData = (file) => {
  const formData = new FormData();

  formData.append("file", file);

  return formData;
};

export const previewImportacaoFuncionarios = async (file) => {
  return requestJson(`${apiUrl}/funcionarios/importar/preview`, {
    method: "POST",
    body: buildImportFormData(file),
  });
};

export const importarFuncionarios = async (file) => {
  return requestJson(`${apiUrl}/funcionarios/importar`, {
    method: "POST",
    body: buildImportFormData(file),
  });
};
