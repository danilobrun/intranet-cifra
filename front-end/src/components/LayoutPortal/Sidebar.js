import { CloseButton, Nav } from "react-bootstrap";
import styled from "styled-components";
import { SidebarItem } from "./SidebarItem";
import { SidebarInstitutionalMenu } from "./SidebarInstitutionalMenu";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/User/User.selectors";
import { Link } from "react-router-dom";
import CifraLogoWhite from "../../assets/img/logo-cifra-branco.png";
import { canAccessContracts } from "../../helpers/contractsPermissions";
import { canAccessBoletins } from "../../helpers/boletinsPermissions";
import {
  faAddressBook,
  faBookOpen,
  faFileContract,
  faSackDollar,
  faFolderOpen,
  faGlobe,
  faHouse,
  faLocationDot,
  faPenToSquare,
  faRobot,
  faShieldHalved,
  faUsersGear,
} from "@fortawesome/free-solid-svg-icons";

export function Sidebar({ isOpen, onClose }) {
  const user = useSelector(selectUser);
  if (!user?._id) return null;

  const menuItems = [
    {
      to: "/portal",
      label: "Início",
      icon: faHouse,
      checkAllPath: true,
      userTypes: [
        "1",
        "compesa",
        "brk",
        "verdeAlagoas",
        "alagoasGerente",
        "sergipe",
        "igua",
        "obras",
        "compras",
        "almoxarifado",
        "rh",
        "financeiro",
        "frota",
        "3",
        "gca",
        "recruitment",
      ],
    },
    {
      to: "/portals",
      label: "Portais",
      icon: faGlobe,
      checkAllPath: true,
      userTypes: [
        "1",
        "compesa",
        "brk",
        "verdeAlagoas",
        "alagoasGerente",
        "sergipe",
        "igua",
        "obras",
        "compras",
        "almoxarifado",
        "rh",
        "financeiro",
        "frota",
        "3",
        "gca",
        "recruitment",
      ],
    },
    {
      to: "/portal/portals",
      label: "Gerenciar Portais",
      icon: faFolderOpen,
      checkAllPath: false,
      userTypes: ["1"],
    },
    {
      to: "/portal/users",
      label: "Gerenciar Usuários",
      icon: faUsersGear,
      checkAllPath: false,
      userTypes: ["1"],
    },
    {
      to: "/portal/roles",
      label: "Roles",
      icon: faShieldHalved,
      checkAllPath: false,
      userTypes: ["1"],
    },
    {
      to: `/portal/editProfile/${user._id}`,
      label: "Editar Perfil",
      icon: faPenToSquare,
      checkAllPath: false,
      userTypes: [
        "1",
        "compesa",
        "brk",
        "verdeAlagoas",
        "alagoasGerente",
        "sergipe",
        "igua",
        "obras",
        "compras",
        "almoxarifado",
        "rh",
        "financeiro",
        "frota",
        "3",
        "gca",
        "recruitment",
      ],
    },
    {
      to: "/diary",
      label: "Agenda Eletrônica",
      icon: faAddressBook,
      checkAllPath: false,
      userTypes: [
        "1",
        "compesa",
        "brk",
        "verdeAlagoas",
        "alagoasGerente",
        "sergipe",
        "igua",
        "obras",
        "compras",
        "almoxarifado",
        "rh",
        "financeiro",
        "frota",
        "3",
      ],
    },
    {
      to: "/portal/addresses",
      label: "Endereços",
      icon: faLocationDot,
      checkAllPath: false,
      userTypes: [
        "1",
        "compesa",
        "brk",
        "verdeAlagoas",
        "alagoasGerente",
        "sergipe",
        "igua",
        "obras",
        "compras",
        "almoxarifado",
        "rh",
        "financeiro",
        "frota",
        "3",
      ],
    },
    {
      to: "/contratos",
      label: "Contratos",
      icon: faFileContract,
      checkAllPath: false,
      canShow: canAccessContracts,
    },
    {
      to: "/boletins",
      label: "Boletins",
      icon: faSackDollar,
      checkAllPath: false,
      canShow: canAccessBoletins,
    },
    {
      to: "/portal/tutorials",
      label: "Tutoriais",
      icon: faBookOpen,
      checkAllPath: false,
      userTypes: [
        "1",
        "compesa",
        "brk",
        "verdeAlagoas",
        "alagoasGerente",
        "sergipe",
        "igua",
        "obras",
        "compras",
        "almoxarifado",
        "rh",
        "financeiro",
        "frota",
        "3",
        "gca",
        "recruitment",
      ],
    },
    {
      to: "/portal/chatbot",
      label: "Chatbot de Frota (BETA)",
      icon: faRobot,
      checkAllPath: false,
      userTypes: ["1"],
    },
  ];

  return (
    <SidebarStyled
      className="bg-dark text-white d-flex flex-column p-3"
      isOpen={isOpen}
    >
      <CloseButton
        variant="white"
        onClick={onClose}
        className="ms-auto d-lg-none"
      />
      <BrandLink as={Link} to="/portal">
        <BrandLogo src={CifraLogoWhite} alt="Cifra" />
      </BrandLink>
      <hr />
      <Nav variant="pills" className="flex-column">
        {menuItems
          .filter((item) =>
            item.canShow
              ? item.canShow(user)
              : item.userTypes.includes(user.roles[0].code),
          )
          .map((item, index) => (
            <SidebarItem key={index} item={item} />
          ))}
      </Nav>
      <SidebarInstitutionalMenu />
    </SidebarStyled>
  );
}

const SidebarStyled = styled.header`
  width: 280px;
  flex: 0 0 280px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  align-self: flex-start;
  height: 100vh;
  overflow-y: auto;

  @media (max-width: 991px) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: 100vh;
    margin-left: 100%;
    transition: all 0.2s linear;

    ${(props) =>
      props.isOpen &&
      `
            margin-left: 0;
        `}
  }
`;

const BrandLink = styled(Nav.Link)`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0;
`;

const BrandLogo = styled.img`
  width: 200px;
  max-width: 100%;
  height: auto;
  object-fit: contain;
`;
