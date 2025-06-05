import { apiUrl, getAuthorizationHeaders } from "./Api.service";
import { removeStorageItem, setStorageItem } from "./Storage.service";

export const login = async (credentialsData) => {
  const body = JSON.stringify(credentialsData);
  const response = await fetch(`${apiUrl}/auth/login/`, {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg);
  }
  return processAuthResponse(data);
};

export const logout = () => {
  removeStorageItem("user");
};

export const createUser = async (userData) => {
  const body = JSON.stringify(userData);
  const response = await fetch(`${apiUrl}/auth/register`, {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg);
  }
  return processAuthResponse(data);
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
