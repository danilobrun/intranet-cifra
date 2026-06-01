import { CloseButton, Nav } from "react-bootstrap";
import styled from "styled-components";
import { SidebarItem } from "./SidebarItem";
import { SidebarInstitutionalMenu } from "./SidebarInstitutionalMenu";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/User/User.selectors";
import { Link } from "react-router-dom";
import CifraLogoWhite from "../../assets/img/logo-cifra-branco.png";

export function Sidebar({ isOpen, onClose }) {
  const user = useSelector(selectUser);
  if (!user?._id) return null;

  const menuItems = [
    {
      to: "/portals",
      text: "🌐 Portais",
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
      text: "📂 Gerenciar Portais",
      checkAllPath: false,
      userTypes: ["1"],
    },
    {
      to: "/portal/users",
      text: "👥 Gerenciar Usuários",
      checkAllPath: false,
      userTypes: ["1"],
    },
    {
      to: "/portal/roles",
      text: "🛡️ Roles",
      checkAllPath: false,
      userTypes: ["1"],
    },
    {
      to: `/portal/editProfile/${user._id}`,
      text: "✏️ Editar Perfil",
      checkAllPath: false,
      userTypes: [
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
      text: "☎️ Agenda Eletrônica",
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
      text: "📍 Endereços",
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
      to: "/portal/contracts",
      text: "📑 Contratos",
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
      to: "/portal/chatbot",
      text: "🤖 Chatbot de Frota (BETA)",
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
      <BrandLink as={Link} to="/portals">
        <BrandLogo src={CifraLogoWhite} alt="Cifra" />
      </BrandLink>
      <hr />
      <Nav variant="pills" className="flex-column">
        {menuItems
          .filter((item) => item.userTypes.includes(user.roles[0].code))
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
  width: 220px;
  max-width: 100%;
  height: auto;
  object-fit: contain;
`;
