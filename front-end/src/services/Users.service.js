import { apiUrl, getAuthorizationHeaders } from "./Api.service";
import { removeStorageItem, setStorageItem } from "./Storage.service";

const postJson = async (url, payload) => {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
    },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || "Falha ao processar a solicitacao.");
  }

  return data;
};

export const login = async (credentialsData) => {
  const data = await postJson(`${apiUrl}/auth/login/`, credentialsData);
  return processAuthResponse(data);
};

export const logout = () => {
  removeStorageItem("user");
};

export const createUser = async (userData) => {
  const data = await postJson(`${apiUrl}/auth/register`, userData);
  return processAuthResponse(data);
};

export const requestPasswordResetCode = async (email) => {
  return postJson(`${apiUrl}/auth/forgot-password/request`, { email });
};

export const verifyPasswordResetCode = async (email, code) => {
  return postJson(`${apiUrl}/auth/forgot-password/verify`, {
    email,
    code,
  });
};

export const resetPassword = async (resetData) => {
  return postJson(`${apiUrl}/auth/forgot-password/reset`, resetData);
};

const processAuthResponse = (data) => {
  const userData = {
    accessToken: data.token,
    ...data.user,
  };
  setStorageItem("user", JSON.stringify(userData));
  return userData;
};

export const getUsers = async () => {
  const response = await fetch(`${apiUrl}/users`, {
    headers: getAuthorizationHeaders(),
  });

  if (response.status === 401) {
    alert("Acesso expirado, favor efetuar login novamente!");
    removeStorageItem("user");
    window.location.href = "https://intranet-cifra.netlify.app/";
    return;
  }
  if (!response.ok) {
    throw new Error("Reponse not ok.");
  }
  return response.json();
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${apiUrl}/user/${userId}`, {
    method: "DELETE",
    headers: getAuthorizationHeaders(),
  });
  if (!response.ok) {
    throw new Error("Reponse not ok.");
  }
};

export const getUserById = async (userId) => {
  const response = await fetch(`${apiUrl}/user/${userId}`, {
    headers: getAuthorizationHeaders(),
  });
  if (response.status === 401) {
    alert("Acesso expirado, favor efetuar login novamente!");
    removeStorageItem("user");
    window.location.href = "https://intranet-cifra.netlify.app/";
    return;
  }
  if (!response.ok) {
    throw new Error("Reponse not ok.");
  }
  return response.json();
};

export const updateUser = async (userId, userData) => {
  const body = JSON.stringify(userData);
  const response = await fetch(`${apiUrl}/user/${userId}`, {
    method: "PUT",
    body,
    headers: {
      "content-type": "application/json",
      ...getAuthorizationHeaders(),
    },
  });
  if (!response.ok) {
    throw new Error("Reponse not ok.");
  }
};
