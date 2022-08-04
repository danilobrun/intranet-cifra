import { store } from "../store/store"
import { selectUser } from "../store/User/User.selectors"

export const apiUrl = process.env.REACT_APP_API_URL

export const getAuthorizationHeaders = () => {
    const state = store.getState() /*pega o estado global da loja do reducer*/
    const user = selectUser(state) /*pega dados só do usuário do estado global*/
    if (user) { /*caso tenha usuário retorna um obj com header e o accessToken*/
        return {
            'authorization': `Bearer ${user.accessToken}`
        }
    }
    return {} /*caso não retornar um obj vazio, lemnbramos que nosso componente de inscriptions faz uma requisição do tipo POST para escrever um novo user*/
}