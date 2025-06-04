import styled from "styled-components";
import { LoginForm } from "../../components/AuthForm/LoginForm";
import { useSelector } from "react-redux";
import { selectIsUserLoggedIn } from "../../store/User/User.selectors";
import { Link } from "react-router-dom";
import background from "../../assets/img/background.png";
import Footer from "../../components/Layout/Footer";
import Logo from "../../assets/img/logo-cifra.png";
import { Button, Carousel, CarouselItem } from "react-bootstrap";
import Brk from "../../assets/img/brk.jpg";
import Cadastro from "../../assets/img/cadastro.png";
import CortRelig from "../../assets/img/cort-relig.png";
import Obra from "../../assets/img/obra-5.png";
import Tele from "../../assets/img/tele.png";
import MataSul from "../../assets/img/mata-sul.jpeg";
import MataNorte from "../../assets/img/mata-norte5.jpeg";
import Obras1 from "../../assets/img/obras-1.png";
import Obras2 from "../../assets/img/obras-2.png";
import Russas from "../../assets/img/russas5.jpeg";

export function HomeView() {
  const isUserLoggedIn = useSelector(selectIsUserLoggedIn);
  return (
    <Container>
      <DivImagem>
        <img src={background} alt="várias imagens da cifra" />
      </DivImagem>
      <DivContent>
        <DivAuth>
          <div className="DivLogo">
            <img src={Logo} alt="logo da cifra" />
          </div>
          <div className="DivAuthContainer">
            <div className="DivAuthContent">
              {isUserLoggedIn ? (
                <DivLogged>
                  <p>Bem-vindo(a)!</p>
                  <p>
                    Você já está logado(a). Clique no botão abaixo para acessar
                    os portais!
                  </p>
                  <Button as={Link} to="/portals">
                    Acessar
                  </Button>
                </DivLogged>
              ) : (
                <LoginForm redirectAfterLogin={true} />
              )}
            </div>
            <div className="DivCarousel">
              <StyledCarousel>
                <CarouselItem>
                  <img src={Brk} alt="first slide" />
                </CarouselItem>
                <CarouselItem>
                  <img src={Cadastro} alt="first slide" />
                </CarouselItem>
                <CarouselItem>
                  <img src={CortRelig} alt="first slide" />
                </CarouselItem>
                <CarouselItem>
                  <img src={Obra} alt="first slide" />
                </CarouselItem>
                <CarouselItem>
                  <img src={Tele} alt="first slide" />
                </CarouselItem>
                <CarouselItem>
                  <img src={MataNorte} alt="first slide" />
                </CarouselItem>
                <CarouselItem>
                  <img src={MataSul} alt="first slide" />
                </CarouselItem>
                <CarouselItem>
                  <img src={Obras1} alt="first slide" />
                </CarouselItem>
                <CarouselItem>
                  <img src={Obras2} alt="first slide" />
                </CarouselItem>
                <CarouselItem>
                  <img src={Russas} alt="first slide" />
                </CarouselItem>
              </StyledCarousel>
            </div>
          </div>
          <Footer />
        </DivAuth>
      </DivContent>
    </Container>
  );
}

const Container = styled.div`
  width: 100dvw;
  min-height: 100vh;
  overflow-x: hidden;
  padding: 2rem 0;
`;

const DivImagem = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(60%);
    object-position: center;
  }
`;

const DivContent = styled.div`
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0 1.5rem;
`;

const DivAuth = styled.div`
  width: 100%;
  background-color: #fff;
  border-radius: 0.5rem;
  overflow: hidden;

  & .DivLogo {
    text-align: center;
    padding: 1rem 0;
  }

  & div:nth-child(1) img {
    width: 200px;
  }

  & .DivAuthContainer {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 1rem;
    align-items: center;

    & .DivAuthContent {
      padding: 1rem;
      width: 100%;
    }

    & .DivAuthContent div:nth-child(1) {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 1rem;
    }

    & .DivCarousel {
      padding: 1rem;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }

  @media (width > 992px) {
    width: 80%;
  }

  @media (width > 1450px) {
    width: 50%;
  }
`;

const StyledCarousel = styled(Carousel)`
  width: 100%;
  height: 350px;

  @media (width < 992px) {
    height: 300px;
  }

  & .carousel-inner,
  .carousel-item {
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 0.5rem;
  }

  & .carousel-inner .carousel-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(70%);
  }
`;

const DivLogged = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;

  & .carousel-indicators {
    display: none;
  }
`;
