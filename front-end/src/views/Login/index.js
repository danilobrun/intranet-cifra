import { Container } from 'react-bootstrap'
import styled from 'styled-components'
import { AuthForm } from '../../components/AuthForm/idenx'

export function LoginView () {
    return (
        <Background className='bg-secondary bg-gradient'>
            <Container className='bg-white rounded p-3 p-md-5'>
                <AuthForm />
            </Container>
        </Background>

    )
}

const Background = styled.main`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
`
