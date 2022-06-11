import { Button, Carousel, Container } from "react-bootstrap";
import { Layout } from "../../components/Layout";
import { Link } from "react-router-dom";
import Cadastramento from '../../assets/img/img-cadastramento-800x600.png'
import Georreferenciamento from '../../assets/img/img-georreferenciamento-800x600.png'
import Corte from '../../assets/img/img-corte-1-800x600.png'
import Religacao from '../../assets/img/img-religacao-800x600.png'
import Obra from '../../assets/img/img-obra1-800x600.png'
import Obra2 from '../../assets/img/img-obra2-800x600.png'
import styled from "styled-components";

export function HomeView () {
    return (
      <Layout>
        <Container>
          <BannerHome className='shadow border p-4 p-md-5 my-3 d-md-flex aling-items-center'>
            <div className="mb-2">
              <h1>Bem vindo(a) a Cifra Engenharia</h1>
              <p>Uma empresa com mais de 15 anos de atuação.</p>
              <p>Conheça nossos portais internos.</p>
              <Button as={Link} to='/portals' className='text-uppercase'>Acessar</Button>
            </div>
            <div>
              <Carousel>
                <Carousel.Item>
                  <img className="d-block w-100" src={ Cadastramento } alt="First slide"/>
                  <Carousel.Caption>
                    <h3>Cadastro e Georreferenciamento</h3>
                    <p>Desenvolvimento de Inteligência Geográfica.</p>
                  </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                  <img className="d-block w-100" src={ Georreferenciamento } alt="First slide"/>
                  <Carousel.Caption>
                    <h3>Desenvolvimento de Sistemas</h3>
                    <p>Desenvolvimento de sistemas GIS.</p>
                  </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                  <img className="d-block w-100" src={ Corte } alt="First slide"/>
                  <Carousel.Caption>
                    <h3>Corte</h3>
                    <p>Prestação de serviços de corte e religação de água.</p>
                  </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                  <img className="d-block w-100" src={ Religacao } alt="First slide"/>
                  <Carousel.Caption>
                    <h3>Religação</h3>
                    <p>Prestação de serviços de corte e religação de água.</p>
                  </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                  <img className="d-block w-100" src={ Obra } alt="First slide"/>
                  <Carousel.Caption>
                    <h3>Obras de Infraestrutura</h3>
                    <p>Atestados de capacidade técnicas nas áreas de infraestrutura.</p>
                  </Carousel.Caption>
                </Carousel.Item> 
                <Carousel.Item>
                  <img className="d-block w-100" src={ Obra2 } alt="First slide"/>
                  <Carousel.Caption>
                    <h3>Manutenção e restauração de patrimônio histórico.</h3>
                    <p>Atestados de capacidade técnicas nas áreas de manutenção predial.</p>
                  </Carousel.Caption>
                </Carousel.Item>  
              </Carousel>
            </div>
          </ BannerHome>
        </Container>
      </ Layout>
    )
  }

  const BannerHome = styled.div`
    & h1 {
      color: rgb(33, 37, 41);
    }
    & p {
      font-size: 1.125rem;
    }
    & > div {
      flex: 1;
    }
  `