import { CloseButton, Nav } from "react-bootstrap";
import styled from "styled-components";
import { SidebarItem } from "./SidebarItem";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/User/User.selectors";
import { Link } from "react-router-dom";

export function Sidebar({ isOpen, onClose }) {
  const user = useSelector(selectUser);
  if (!user?._id) return null;

  const menuItems = [
    {
      to: "/portal",
      text: "Dashboard",
      checkAllPath: true,
      userTypes: ["1", "2-1", "2-2", "2-2-1", "2-2-2", "3"],
    },
    {
      to: "/portal/portals",
      text: "Portais",
      checkAllPath: false,
      userTypes: ["1"],
    },
    {
      to: "/portal/users",
      text: "Usuários",
      checkAllPath: false,
      userTypes: ["1"],
    },
    {
      to: `/portal/editProfile/${user._id}`,
      text: "Editar dados",
      checkAllPath: false,
      userTypes: [
        "2-1",
        "2-1-1",
        "2-1-2",
        "2-2",
        "2-2-1",
        "2-2-2",
        "2-2-3",
        "2-3",
        "2-3-1",
        "2-3-2",
        "2-3-3",
        "2-3-4",
        "2-4",
        "2-4-1",
        "2-4-2",
        "2-5",
        "2-5-1",
        "2-6",
        "3",
      ],
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
      <Nav.Link className="h2 text-white" as={Link} to="/">
        Intranet Cifra
      </Nav.Link>
      <hr />
      <Nav variant="pills" className="flex-column">
        {menuItems
          .filter((item) => item.userTypes.includes(user.roles[0].code))
          .map((item, index) => (
            <SidebarItem key={index} item={item} />
          ))}
      </Nav>
    </SidebarStyled>
  );
}

const SidebarStyled = styled.header`
  width: 280px;
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
