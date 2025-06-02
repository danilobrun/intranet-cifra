import styled from "styled-components";
import { LoginForm } from "../../components/AuthForm/LoginForm";
import { useSelector } from "react-redux";
import { selectIsUserLoggedIn } from "../../store/User/User.selectors";
import { Link } from "react-router-dom";
import background from "../../assets/img/background.png";
import Footer from "../../components/Layout/Footer";
import Logo from "../../assets/img/logo-cifra.png";
import { Button } from "react-bootstrap";

export function HomeView() {
  const isUserLoggedIn = useSelector(selectIsUserLoggedIn);
  return (
    <Container>
      <DivImagem>
        <img
          src={background}
          style={{ filter: "brightness(60%)" }}
          alt="várias imagens da cifra"
        />
      </DivImagem>
      <DivContent>
        <DivAuth>
          <div className="DivAuthContent">
            <div>
              <img src={Logo} alt="logo da cifra" />
            </div>
            {isUserLoggedIn ? (
              <DivLogged>
                <p>Bem-vindo(a)!</p>
                <p>
                  Você já está logado(a). Clique no botão abaixo para acessar os
                  portais!
                </p>
                <Button as={Link} to="/portals">
                  Acessar
                </Button>
              </DivLogged>
            ) : (
              <LoginForm redirectAfterLogin={true} />
            )}
          </div>
          <Footer />
        </DivAuth>
      </DivContent>
    </Container>
  );
}

const Container = styled.div`
  width: 100dvw;
  height: 100dvh;
`;

const DivImagem = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100dvw;
  height: 100dvh;
  z-index: -1;
  overflow: hidden;

  & img {
    width: 100dvw;
    height: 100dvh;
    object-fit: cover;
  }
`;

const DivContent = styled.div`
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 0 1.5rem;
`;

const DivAuth = styled.div`
  width: 100%;
  background-color: #fff;
  border-radius: 0.5rem;
  overflow: hidden;

  & .DivAuthContent {
    padding: 1rem;
  }

  & .DivAuthContent div:nth-child(1) {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem;
  }

  & .DivAuthContent div img {
    width: 200px;
  }

  @media (width > 992px) {
    width: 80%;
  }

  @media (width > 1450px) {
    width: 40%;
  }
`;

const DivLogged = styled.div`
  width: 100%;
  text-align: center;
`;
