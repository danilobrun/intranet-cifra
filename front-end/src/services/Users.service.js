import { apiUrl } from "./Api.service";
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
