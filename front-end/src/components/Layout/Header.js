import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from 'react-router-dom';
import Logo from '../../assets/img/logo-cifra.png';
import styled from 'styled-components';
import { useSelector } from 'react-redux'
import { selectIsUserLoggedIn } from "../../store/User/User.selectors";

export function Header () {
  const isUserLoggedIn = useSelector(selectIsUserLoggedIn)
    return (
      <header>
        <NavbarStyled bg='secondary bg-gradient' variant="light" expand='md'>
          <Container>
            <Navbar.Brand as={Link} to='/'>
               <img src={Logo} alt='Instituto Infnet' width={181} height={50} />
            </Navbar.Brand>
            <NavbarToggleStyled aria-controls='navbar-header' />
            <Navbar.Collapse id='navbar-header'>
              <Nav className='ms-auto'>
                <NavLinkStyled forwardedAs={Link} to='/'>Home</NavLinkStyled>
                <NavLinkStyled forwardedAs={Link} to='/portals'>Portais</NavLinkStyled>
                {isUserLoggedIn ? (
                  <NavLinkStyled forwardedAs={Link} to='/portal'>Acessar Portal</NavLinkStyled>
                ) : (
                  <NavLinkStyled forwardedAs={Link} to='/portal/login'>Login</NavLinkStyled>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </NavbarStyled> 
      </header>
    )
  }

  const NavbarStyled = styled(Navbar)`
    /* background-color: #699EEE; */

  `

  const NavbarToggleStyled = styled(Navbar.Toggle)`
    background: #FFF;
    border: none;
  `

  const NavLinkStyled = styled(Nav.Link)`
    background-color: #FFF;
    border-radius: 3px;
    text-align: center;
    margin: 5px 0;
    box-shadow: 2px 2px 2px rgba(42, 69, 136, 0.3);
    @media (min-width: 768px) {
      margin: 0 5px;
    }
  `