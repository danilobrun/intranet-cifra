import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";

export default function Footer () {
  return (
    <FooterStyled className="bg-secondary bg-gradient text-center py-2 mt-4">
    <Container className="d-lg-flex align-items-center justify-content-center">
        <Nav className="flex-column flex-lg-row my-4 my-lg-0">
            <Nav.Link as={Link} to='/' className="text-white">Início</Nav.Link>
            <Nav.Link as={Link} to='/portal/login' className="text-white">Cadastro</Nav.Link>
            <Nav.Link as={Link} to='/portal/login' className="text-white">Login</Nav.Link>
            <Nav.Link href="/termos-de-uso.pdf" target="_blank" className="text-white">Termos de Uso</Nav.Link>
        </Nav>
        <Nav className="justify-content-center">
            <Nav.Link href="https://www.linkedin.com/company/cifra-engenharia" target="_blank" className="text-white">
                <IconStyled icon={faLinkedin} />
            </Nav.Link>
            <Nav.Link href="https://www.instagram.com" target="_blank" className="text-white">
                <IconStyled icon={faInstagram} />
            </Nav.Link>
        </Nav>
    </Container>
</FooterStyled>
  )
}

const FooterStyled = styled.footer`
    padding: 35px 0 40px;
    @media (min-width: 992px) {
        padding: 15px 0;
    }
`

const IconStyled = styled(FontAwesomeIcon)`
    font-size: 40px;
`