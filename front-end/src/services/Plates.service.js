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

export const getPlates = async (filters = {}) => {
  return requestJson(buildUrlWithQuery("/plates", filters));
};

export const getInactivePlates = async (filters = {}) => {
  return requestJson(buildUrlWithQuery("/plates/inactive", filters));
};

export const getPlateById = async (plateId) => {
  return requestJson(`${apiUrl}/plates/${plateId}`);
};

export const createPlate = async (plateData) => {
  return requestJson(`${apiUrl}/plates`, {
    method: "POST",
    body: JSON.stringify(plateData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const updatePlate = async (plateId, plateData) => {
  return requestJson(`${apiUrl}/plates/${plateId}`, {
    method: "PATCH",
    body: JSON.stringify(plateData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const desactivatePlate = async (plateId) => {
  return requestJson(`${apiUrl}/plates/${plateId}`, {
    method: "DELETE",
  });
};

export const restorePlate = async (plateId) => {
  return requestJson(`${apiUrl}/plates/${plateId}/restore`, {
    method: "PATCH",
  });
};

export const getPlateMovements = async (plateId) => {
  return requestJson(`${apiUrl}/plates/${plateId}/movements`);
};
