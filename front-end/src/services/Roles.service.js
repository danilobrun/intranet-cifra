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

export const getRoles = async () => {
  return requestJson(`${apiUrl}/roles`);
};

export const getRoleById = async (roleId) => {
  return requestJson(`${apiUrl}/roles/${roleId}`);
};

export const getRolePortalOptions = async () => {
  return requestJson(`${apiUrl}/roles/portals/options`);
};

export const createRole = async (roleData) => {
  return requestJson(`${apiUrl}/roles`, {
    method: "POST",
    body: JSON.stringify(roleData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const updateRole = async (roleId, roleData) => {
  return requestJson(`${apiUrl}/roles/${roleId}`, {
    method: "PUT",
    body: JSON.stringify(roleData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const deleteRole = async (roleId) => {
  return requestJson(`${apiUrl}/roles/${roleId}`, {
    method: "DELETE",
  });
};
