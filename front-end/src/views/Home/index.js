import styled from "styled-components";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { LoginForm } from "../../components/AuthForm/LoginForm";
import { PublicAuthLayout } from "../../components/PublicAuthLayout";
import { selectIsUserLoggedIn } from "../../store/User/User.selectors";

export function HomeView() {
  const isUserLoggedIn = useSelector(selectIsUserLoggedIn);

  return (
    <PublicAuthLayout>
      {isUserLoggedIn ? (
        <DivLogged>
          <p>Bem-vindo(a)!</p>
          <p>
            Você já está logado(a). Clique no botão abaixo para acessar a
            intranet!
          </p>
          <Button as={Link} to="/portal">
            Acessar
          </Button>
        </DivLogged>
      ) : (
        <LoginForm redirectAfterLogin={true} />
      )}
    </PublicAuthLayout>
  );
}

const DivLogged = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;

  & .carousel-indicators {
    display: none;
  }
`;
