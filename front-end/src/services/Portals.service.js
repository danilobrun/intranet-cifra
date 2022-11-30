import { apiUrl, getAuthorizationHeaders } from "./Api.service";

export const getPortals = async () => {
  const response = await fetch(`${apiUrl}/portals`, {
    headers: getAuthorizationHeaders(),
  });
  if (!response.ok) {
    throw new Error("Reponse not ok.");
  }
  return response.json();
};

export const getPortalById = async (portalId) => {
  const response = await fetch(
    `${apiUrl}/portals/${portalId}?_embed=inscriptions`,
    {
      headers: getAuthorizationHeaders(),
    }
  );
  if (!response.ok) {
    throw new Error("Reponse not ok.");
  }
  return response.json();
};

export const deletePortal = async (portalId) => {
  const response = await fetch(`${apiUrl}/portals/${portalId}`, {
    method: "DELETE",
    headers: getAuthorizationHeaders(),
  });
  if (!response.ok) {
    throw new Error("Reponse not ok.");
  }
};

export const createPortal = async (portalData) => {
  const body = JSON.stringify(portalData);
  const response = await fetch(`${apiUrl}/portals/auth/register`, {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      ...getAuthorizationHeaders(),
    },
  });
  if (!response.ok) {
    throw new Error("Response not ok.");
  }
};

export const updatePortal = async (portalId, portalData) => {
  const body = JSON.stringify(portalData);
  const response = await fetch(`${apiUrl}/portals/${portalId}`, {
    method: "PUT",
    body,
    headers: {
      "content-type": "application/json",
      ...getAuthorizationHeaders(),
    },
  });
  if (!response.ok) {
    throw new Error("Response not ok.");
  }
};
