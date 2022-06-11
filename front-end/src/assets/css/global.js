import { createGlobalStyle } from 'styled-components'

export const GlobalStyled = createGlobalStyle`
    html, body, #root {
        height: 100%;
    }
    #root {
        display: flex;
        flex-direction: column;
    }
    #root > main {
        flex: 1
    }
`