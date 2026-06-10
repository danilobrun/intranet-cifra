import styled from "styled-components";
import { Carousel, CarouselItem } from "react-bootstrap";
import { Link } from "react-router-dom";
import background from "../../assets/img/background.png";
import Logo from "../../assets/img/logo-cifra.png";
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

const carouselSlides = [
  {
    src: Brk,
    alt: "Equipe operacional da Cifra em frente de servico",
  },
  {
    src: Cadastro,
    alt: "Equipe da Cifra reunida para foto institucional",
  },
  {
    src: CortRelig,
    alt: "Colaborador da Cifra em atividade de campo",
  },
  {
    src: Obra,
    alt: "Obra acompanhada por equipe da Cifra",
  },
  {
    src: Tele,
    alt: "Equipe da Cifra em reuniao remota",
  },
  {
    src: MataNorte,
    alt: "Frente de servico da Cifra na Mata Norte",
  },
  {
    src: MataSul,
    alt: "Frente de servico da Cifra na Mata Sul",
  },
  {
    src: Obras1,
    alt: "Acompanhamento de obra da Cifra",
  },
  {
    src: Obras2,
    alt: "Vistoria tecnica realizada pela Cifra",
  },
  {
    src: Russas,
    alt: "Equipe da Cifra em frente de servico",
    objectPosition: "center 32%",
  },
];

export function PublicAuthLayout({ children }) {
  return (
    <AuthPage>
      <DivImagem>
        <img src={background} alt="" aria-hidden="true" />
      </DivImagem>

      <AuthPanel>
        <AuthColumn>
          <BrandLink to="/" aria-label="Ir para o inicio">
            <LogoImage src={Logo} alt="Cifra Engenharia e Servicos" />
          </BrandLink>

          <AuthContent>{children}</AuthContent>

          <AuthFooter>
            <FooterLink to="/">Inicio</FooterLink>
            <FooterAnchor
              href="codigo-conduta-cifra.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Codigo de Conduta
            </FooterAnchor>
            <FooterAnchor
              href="relatorio-igualdade-salario.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Relatorio de Igualdade Salarial
            </FooterAnchor>
          </AuthFooter>
        </AuthColumn>

        <CarouselColumn>
          <StyledCarousel controls={false} interval={4500} pause="hover">
            {carouselSlides.map((slide) => (
              <CarouselItem key={slide.alt}>
                <SlideImage
                  src={slide.src}
                  alt={slide.alt}
                  $objectPosition={slide.objectPosition}
                />
                <SlideOverlay>
                  <SlideTitle>
                    Portais e informacoes internas em um so lugar
                  </SlideTitle>
                  <SlideText>
                    Acesse links, contratos e dados operacionais conforme o seu
                    perfil.
                  </SlideText>
                </SlideOverlay>
              </CarouselItem>
            ))}
          </StyledCarousel>
        </CarouselColumn>
      </AuthPanel>
    </AuthPage>
  );
}

const AuthPage = styled.main`
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  display: grid;
  place-items: center;
  padding: clamp(24px, 5vw, 48px);
  position: relative;
`;

const DivImagem = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        110deg,
        oklch(15% 0.018 245 / 0.7),
        oklch(19% 0.018 245 / 0.48)
      ),
      oklch(18% 0.01 245 / 0.22);
  }

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(62%) saturate(92%);
    object-position: center;
  }
`;

const AuthPanel = styled.section`
  --auth-column-block-padding: clamp(28px, 4.5vw, 54px);

  width: 100%;
  max-width: 1380px;
  min-height: min(760px, calc(100vh - 96px));
  display: grid;
  grid-template-columns: minmax(340px, 0.82fr) minmax(460px, 1.18fr);
  gap: 12px;
  padding: 10px;
  border: 1px solid oklch(92% 0.012 235);
  border-radius: 18px;
  background: oklch(99% 0.004 240);
  box-shadow: 0 24px 80px oklch(13% 0.02 245 / 0.3);
  overflow: hidden;

  @media (max-width: 991.98px) {
    min-height: auto;
    grid-template-columns: 1fr;
    max-width: 720px;
  }

  @media (max-width: 575.98px) {
    padding: 8px;
    border-radius: 14px;
  }
`;

const AuthColumn = styled.div`
  display: flex;
  min-height: 100%;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;
  padding: var(--auth-column-block-padding) clamp(24px, 4vw, 46px);

  @media (max-width: 991.98px) {
    gap: 28px;
    min-height: auto;
  }

  @media (max-width: 575.98px) {
    padding: 24px 18px;
  }
`;

const BrandLink = styled(Link)`
  width: fit-content;
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  text-decoration: none;
`;

const LogoImage = styled.img`
  width: clamp(154px, 14vw, 190px);
  height: auto;
  display: block;
`;

const AuthContent = styled.div`
  width: 100%;
  max-width: 430px;
  align-self: center;
`;

const AuthFooter = styled.nav`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  gap: 10px 16px;
  flex-wrap: wrap;
  color: oklch(48% 0.016 245);
  font-size: 0.86rem;
  line-height: 1.4;
  text-align: center;

  @media (max-width: 575.98px) {
    max-width: 320px;
  }
`;

const footerLinkStyles = `
  color: inherit;
  text-decoration: none;
  transition: color 160ms ease;

  &:hover,
  &:focus {
    color: oklch(48% 0.16 253);
    text-decoration: underline;
  }
`;

const FooterLink = styled(Link)`
  ${footerLinkStyles}
`;

const FooterAnchor = styled.a`
  ${footerLinkStyles}
`;

const CarouselColumn = styled.aside`
  min-height: 0;
  display: grid;
  align-self: stretch;
  overflow: hidden;

  @media (max-width: 991.98px) {
    height: 360px;
  }

  @media (max-width: 575.98px) {
    height: 300px;
  }
`;

const StyledCarousel = styled(Carousel)`
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  border-radius: 14px;
  overflow: hidden;
  background: oklch(18% 0.012 245);

  & .carousel-inner {
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    border-radius: inherit;
  }

  & .carousel-item {
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    position: relative;
  }

  & .carousel-indicators {
    right: auto;
    bottom: 22px;
    left: 50%;
    width: auto;
    margin: 0;
    padding: 5px 8px;
    border-radius: 999px;
    background: oklch(12% 0.01 245 / 0.55);
    transform: translateX(-50%);
  }

  & .carousel-indicators [data-bs-target] {
    width: 7px;
    height: 7px;
    border: 0;
    border-radius: 999px;
    background-color: oklch(94% 0.006 240);
    opacity: 0.45;
  }

  & .carousel-indicators .active {
    width: 20px;
    opacity: 0.96;
  }
`;

const SlideImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: block;
  object-fit: cover;
  object-position: ${({ $objectPosition }) => $objectPosition || "center"};
  filter: saturate(96%) contrast(96%);
`;

const SlideOverlay = styled.div`
  position: absolute;
  inset: auto 0 0;
  padding: 96px clamp(24px, 4vw, 46px) 70px;
  color: oklch(98% 0.004 240);
  background: linear-gradient(
    180deg,
    oklch(12% 0.012 245 / 0),
    oklch(12% 0.012 245 / 0.78)
  );
`;

const SlideTitle = styled.p`
  max-width: 440px;
  margin: 0 0 8px;
  font-size: clamp(1.38rem, 2.4vw, 2rem);
  font-weight: 700;
  line-height: 1.12;
`;

const SlideText = styled.p`
  max-width: 440px;
  margin: 0;
  color: oklch(89% 0.008 240);
  font-size: 0.98rem;
  line-height: 1.5;
`;
