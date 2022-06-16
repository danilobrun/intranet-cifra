import { apiUrl, getAuthorizationHeaders } from "./Api.service"

export const getPortals = async () => {
    const response = await fetch(`${apiUrl}/portals`)
            if (!response.ok) {
                throw new Error('Reponse not ok.')
            }
            return response.json()
}

export const getPortalById = async (portalId) => {
    const response = await fetch(`${apiUrl}/portals/${portalId}?_embed=inscriptions`)
            if (!response.ok) {
                throw new Error('Reponse not ok.')
            }
            return response.json()
}

export const deletePortal = async portalId => {
    const response = await fetch(`${apiUrl}/portals/${portalId}`, {
        method: 'DELETE',
        headers: getAuthorizationHeaders()
    })
    if (!response.ok) {
        throw new Error('Reponse not ok.')
    }
}