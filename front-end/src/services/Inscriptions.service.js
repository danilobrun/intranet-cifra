import { selectUser } from "../store/User/User.selectors"
import { apiUrl } from "./Api.service"
import { store } from "../store/store"

export const createInscriptions = async (inscriptionData) => {
    const state = store.getState()
    const user = selectUser(state)
    const response = await fetch(`${apiUrl}/inscriptions`, {
                method: 'POST',
                body: JSON.stringify(inscriptionData),
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${user.accessToken}`
                }
            })
            if (!response.ok) {
                throw new Error('Reponse not ok.')
            }
}