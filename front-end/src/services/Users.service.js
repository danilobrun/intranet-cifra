import { apiUrl, getAuthorizationHeaders } from "./Api.service";
import { removeStorageItem, setStorageItem } from "./Storage.service";

let myAvatarCacheUserId = null;
let myAvatarCacheUrl = "";
let myAvatarCacheLoaded = false;
let myAvatarCachePromise = null;
let myAvatarCacheRequestId = 0;

const revokeAvatarObjectUrl = (avatarUrl) => {
  if (
    avatarUrl &&
    typeof URL !== "undefined" &&
    typeof URL.revokeObjectURL === "function"
  ) {
    URL.revokeObjectURL(avatarUrl);
  }
};

const createAvatarObjectUrl = (avatarBlob) => {
  if (
    !avatarBlob ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return "";
  }

  return URL.createObjectURL(avatarBlob);
};

export const clearMyAvatarCache = () => {
  revokeAvatarObjectUrl(myAvatarCacheUrl);
  myAvatarCacheUserId = null;
  myAvatarCacheUrl = "";
  myAvatarCacheLoaded = false;
  myAvatarCachePromise = null;
  myAvatarCacheRequestId += 1;
};

const handleExpiredSession = () => {
  alert("Acesso expirado, favor efetuar login novamente!");
  clearMyAvatarCache();
  removeStorageItem("user");
  window.location.href = "https://intranet-cifra.netlify.app/";
};

const getResponseMessage = async (response, fallbackMessage) => {
  try {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return data.msg || fallbackMessage;
    }
  } catch (error) {
    return fallbackMessage;
  }

  return fallbackMessage;
};

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
  clearMyAvatarCache();
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
  clearMyAvatarCache();

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
    handleExpiredSession();
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
    handleExpiredSession();
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

const requestAvatarBlob = async (url, options = {}, config = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthorizationHeaders(),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    handleExpiredSession();
    return null;
  }

  if (config.allowNotFound && response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const message = await getResponseMessage(
      response,
      "Falha ao processar a foto de perfil.",
    );
    throw new Error(message);
  }

  return response.blob();
};

const sendAvatarCpf = async (url, cpf) => {
  const response = await fetch(url, {
    method: "PUT",
    body: JSON.stringify({ cpf }),
    headers: {
      "content-type": "application/json",
      ...getAuthorizationHeaders(),
    },
  });

  if (response.status === 401) {
    handleExpiredSession();
    return null;
  }

  if (!response.ok) {
    const message = await getResponseMessage(
      response,
      "Falha ao salvar a foto de perfil.",
    );
    throw new Error(message);
  }

  return response.json();
};

const previewAvatarCpf = (url, cpf) =>
  requestAvatarBlob(url, {
    method: "POST",
    body: JSON.stringify({ cpf }),
    headers: {
      "content-type": "application/json",
    },
  });

export const getMyAvatar = () =>
  requestAvatarBlob(`${apiUrl}/users/me/avatar`, {}, { allowNotFound: true });

const prepareMyAvatarCacheForUser = (userId) => {
  if (myAvatarCacheUserId === userId) {
    return;
  }

  clearMyAvatarCache();
  myAvatarCacheUserId = userId;
};

export const getCachedMyAvatarUrl = (userId) => {
  if (!userId || myAvatarCacheUserId !== userId || !myAvatarCacheLoaded) {
    return "";
  }

  return myAvatarCacheUrl;
};

export const getMyAvatarUrl = async (userId) => {
  if (!userId) {
    return "";
  }

  prepareMyAvatarCacheForUser(userId);

  if (myAvatarCacheLoaded) {
    return myAvatarCacheUrl;
  }

  if (myAvatarCachePromise) {
    return myAvatarCachePromise;
  }

  const requestId = myAvatarCacheRequestId;

  myAvatarCachePromise = getMyAvatar()
    .then((avatarBlob) => {
      if (
        requestId !== myAvatarCacheRequestId ||
        myAvatarCacheUserId !== userId
      ) {
        return "";
      }

      revokeAvatarObjectUrl(myAvatarCacheUrl);
      myAvatarCacheUrl = createAvatarObjectUrl(avatarBlob);
      myAvatarCacheLoaded = true;
      myAvatarCachePromise = null;

      return myAvatarCacheUrl;
    })
    .catch((error) => {
      if (
        requestId === myAvatarCacheRequestId &&
        myAvatarCacheUserId === userId
      ) {
        myAvatarCacheUrl = "";
        myAvatarCacheLoaded = false;
        myAvatarCachePromise = null;
      }

      throw error;
    });

  return myAvatarCachePromise;
};

export const previewMyAvatar = (cpf) =>
  previewAvatarCpf(`${apiUrl}/users/me/avatar/preview`, cpf);

export const updateMyAvatar = async (cpf) => {
  const data = await sendAvatarCpf(`${apiUrl}/users/me/avatar`, cpf);
  clearMyAvatarCache();
  return data;
};

export const getUserAvatar = (userId) =>
  requestAvatarBlob(`${apiUrl}/users/${userId}/avatar`, {}, {
    allowNotFound: true,
  });

export const previewUserAvatar = (userId, cpf) =>
  previewAvatarCpf(`${apiUrl}/users/${userId}/avatar/preview`, cpf);

export const updateUserAvatar = (userId, cpf) =>
  sendAvatarCpf(`${apiUrl}/users/${userId}/avatar`, cpf);
