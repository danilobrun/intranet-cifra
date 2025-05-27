import { Button, Carousel } from "react-bootstrap";
import Cadastramento from "../../assets/img/img-cadastramento-800x600.png";
import Georreferenciamento from "../../assets/img/img-georreferenciamento-800x600.png";
import Corte from "../../assets/img/img-corte-1-800x600.png";
import Religacao from "../../assets/img/img-religacao-800x600.png";
import Obra from "../../assets/img/img-obra1-800x600.png";
import Obra2 from "../../assets/img/img-obra2-800x600.png";
import styled from "styled-components";
import { LoginForm } from "../../components/AuthForm/LoginForm";
import Logo from "../../assets/img/logo-cifra.png";
import { useSelector } from "react-redux";
import { selectIsUserLoggedIn } from "../../store/User/User.selectors";
import { Link } from "react-router-dom";

export function HomeView() {
  const isUserLoggedIn = useSelector(selectIsUserLoggedIn);
  return (
    <Container>
      <AuthContent>
        <div>
          <img src={Logo} alt="logo da cifra" />
        </div>
        <DivAuth>
          <LoginForm redirectAfterLogin={true} />
        </DivAuth>
        {/* {isUserLoggedIn ? (
          <DivAuth>
            <h2>Seja bem vindo(a)</h2>
            <Button as={Link} to={"/portals"} className="w-100">
              Acessar portais
            </Button>
          </DivAuth>
        ) : (
          <DivAuth>
            <LoginForm redirectAfterLogin={true} />
          </DivAuth>
        )} */}
      </AuthContent>
      <Apresentation>
        <DivTitle>
          <h1>Bem vindo(a) a Cifra Engenharia</h1>
          <p>Uma empresa com mais de 15 anos de atuação.</p>
        </DivTitle>
        <Carrosel>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src={Cadastramento}
              alt="First slide"
            />
            <Carousel.Caption>
              <h3>Cadastro e Georreferenciamento</h3>
              <p>Desenvolvimento de Inteligência Geográfica.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src={Georreferenciamento}
              alt="First slide"
            />
            <Carousel.Caption>
              <h3>Desenvolvimento de Sistemas</h3>
              <p>Desenvolvimento de sistemas GIS.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src={Corte} alt="First slide" />
            <Carousel.Caption>
              <h3>Corte</h3>
              <p>Prestação de serviços de corte e religação de água.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src={Religacao} alt="First slide" />
            <Carousel.Caption>
              <h3>Religação</h3>
              <p>Prestação de serviços de corte e religação de água.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src={Obra} alt="First slide" />
            <Carousel.Caption>
              <h3>Obras de Infraestrutura</h3>
              <p>
                Atestados de capacidade técnicas nas áreas de infraestrutura.
              </p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src={Obra2} alt="First slide" />
            <Carousel.Caption>
              <h3>Manutenção e restauração de patrimônio histórico.</h3>
              <p>
                Atestados de capacidade técnicas nas áreas de manutenção
                predial.
              </p>
            </Carousel.Caption>
          </Carousel.Item>
        </Carrosel>
      </Apresentation>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  height: 100dvh;
  width: 100dvw;
`;

const AuthContent = styled.div`
  width: 30%;
  border-radius: 0 2rem 2rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 5rem;
  background-color: rgb(240, 240, 245);

  & > div:nth-child(1) {
    width: 200px;
    margin-bottom: 1rem;
  }

  & div img {
    width: 100%;
  }

  @media (max-width: 1540px) {
    padding: 0 3rem;
  }
`;

const DivAuth = styled.div`
  width: 100%;
`;

const Apresentation = styled.div`
  width: 75%;
  height: 100dvh;
  margin-left: -2rem;
  z-index: -1;
  position: relative;
`;

const DivTitle = styled.div`
  position: absolute;
  width: 100%;
  top: 30%;
  left: 0;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const Carrosel = styled(Carousel)`
  height: 100%;
  width: 100%;
  overflow: hidden;
  & .carousel-item {
    max-height: 100%;
  }

  & .carousel-item img {
    filter: brightness(50%);
    height: 100%;
    object-fit: contain;
  }

  & .carousel-control-prev,
  .carousel-control-next {
    display: none;
  }

  & .carousel-caption {
    position: absolute;
    bottom: 8%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  @media (max-width: 1540px) {
    & .carousel-caption {
      bottom: 10%;
    }
  }
`;
