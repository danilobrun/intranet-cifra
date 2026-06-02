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
    throw new Error(data.msg || "Response not ok.");
  }

  return data;
};

const getQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const getTutorials = async ({ search } = {}) => {
  return requestJson(`${apiUrl}/tutorials${getQueryString({ q: search })}`);
};

export const getAdminTutorials = async ({ search, status } = {}) => {
  return requestJson(
    `${apiUrl}/admin/tutorials${getQueryString({ q: search, status })}`,
  );
};

export const getTutorialById = async (tutorialId) => {
  return requestJson(`${apiUrl}/tutorials/${tutorialId}`);
};

export const createTutorial = async (tutorialData) => {
  return requestJson(`${apiUrl}/tutorials`, {
    method: "POST",
    body: JSON.stringify(tutorialData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const updateTutorial = async (tutorialId, tutorialData) => {
  return requestJson(`${apiUrl}/tutorials/${tutorialId}`, {
    method: "PUT",
    body: JSON.stringify(tutorialData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const updateTutorialStatus = async (tutorialId, status) => {
  return requestJson(`${apiUrl}/tutorials/${tutorialId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const archiveTutorial = async (tutorialId) => {
  return requestJson(`${apiUrl}/tutorials/${tutorialId}`, {
    method: "DELETE",
  });
};

export const deleteTutorialPermanently = async (tutorialId) => {
  return requestJson(`${apiUrl}/tutorials/${tutorialId}/permanent`, {
    method: "DELETE",
  });
};
