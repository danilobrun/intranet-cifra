import { Container, Dropdown, Nav, Navbar } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";
import DropdownToggle from "react-bootstrap/esm/DropdownToggle";
import NavbarToggle from "react-bootstrap/esm/NavbarToggle";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../services/Users.service";
import { useNavigate } from "react-router-dom";
import { userLogout } from "../../store/User/User.actions";
import { selectUser } from "../../store/User/User.selectors";

export function Topbar ({ onOpen }) {
    const user = useSelector(selectUser)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const handleLogout = () => {
        logout()
        dispatch(userLogout())
        navigate('/')
    }
    return (
        <Navbar bg='light' expand='lg'>
            <Container fluid>
                <NavbarToggle onClick={onOpen} />
                <Nav className="ms-auto">
                    <Dropdown align='end'>
                        <DropdownToggle variant="light">{user.name}</DropdownToggle>
                            <MenuStyled>
                                <DropdownItem onClick={handleLogout}>Sair</DropdownItem>  
                            </MenuStyled>
                    </Dropdown>
                </Nav>
            </Container>
        </Navbar>
    )
}

const MenuStyled = styled(DropdownMenu)`
    position: absolute !important;
`