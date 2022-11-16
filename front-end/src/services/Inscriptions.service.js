import { apiUrl, getAuthorizationHeaders } from "./Api.service";

/*Requisição de inscrição tem que passar o header com a chave accessToken do usuário*/
export const createInscriptions = async (inscriptionData) => {
  const response = await fetch(`${apiUrl}/inscriptions/auth/register`, {
    method: "POST",
    body: JSON.stringify(inscriptionData) /*convertido em JSON string*/,
    headers: {
      "content-type": "application/json",
      ...getAuthorizationHeaders() /*função específica para trazer o accessToken do usuário*/,
    },
  });
  if (!response.ok) {
    throw new Error("Reponse not ok.");
  }
};
