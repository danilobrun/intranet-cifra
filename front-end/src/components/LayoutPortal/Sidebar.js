import { useEffect, useState } from "react";
import { CloseButton, Nav } from "react-bootstrap";
import styled from "styled-components";
import { SidebarItem } from "./SidebarItem";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarInstitutionalMenu } from "./SidebarInstitutionalMenu";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/User/User.selectors";
import { Link, useLocation } from "react-router-dom";
import CifraLogoWhite from "../../assets/img/logo-cifra-branco.png";
import { canAccessContracts } from "../../helpers/contractsPermissions";
import { canAccessBoletins } from "../../helpers/boletinsPermissions";
import { canAccessResumoContratos } from "../../helpers/resumoContratosPermissions";
import { canManageCentrosCusto } from "../../helpers/centroCustoPermissions";
import {
  faAddressBook,
  faBookOpen,
  faCarSide,
  faClipboardList,
  faFileContract,
  faFileInvoiceDollar,
  faSackDollar,
  faFolderOpen,
  faGlobe,
  faHouse,
  faLocationDot,
  faPenToSquare,
  faRightLeft,
  faRobot,
  faShieldHalved,
  faSitemap,
  faUsers,
  faUsersGear,
} from "@fortawesome/free-solid-svg-icons";

const CifraLogoMark = `${process.env.PUBLIC_URL}/images/logo-cifra-transparent.png`;

const menuSections = [
  {
    key: "general",
    label: "Geral",
    icon: faHouse,
  },
  {
    key: "management",
    label: "Gerenciamento",
    icon: faUsersGear,
  },
  {
    key: "contracts",
    label: "Contratos & BMs",
    icon: faFileContract,
  },
  {
    key: "costCenter",
    label: "Centro de Custo",
    icon: faUsers,
  },
];

const normalizePath = (path) => path.replace(/\/+$/, "") || "/";

const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getUserRoles = (user) => (Array.isArray(user?.roles) ? user.roles : []);

const getUserRoleCodes = (user) =>
  getUserRoles(user).map((role) => String(role?.code || role));

const userIsAdmin = (user) =>
  getUserRoles(user).some((role) => {
    const code = String(role?.code || role).trim();
    const cargo = normalizeText(role?.cargo);

    return code === "1" || cargo === "admin" || cargo === "administrador";
  });

const canShowMenuItem = (item, user) => {
  if (item.canShow) {
    return item.canShow(user);
  }

  const roleCodes = getUserRoleCodes(user);
  return roleCodes.some((code) => item.userTypes.includes(code));
};

const isMenuItemActive = (item, pathname) => {
  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(item.to);

  return item.checkAllPath
    ? currentPath === targetPath
    : currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

const useIsDesktop = () => {
  const getMatches = () =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 992px)").matches
      : true;

  const [isDesktop, setIsDesktop] = useState(getMatches);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(min-width: 992px)");
    const handleChange = () => setIsDesktop(mediaQuery.matches);

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return isDesktop;
};

export function Sidebar({ isOpen, isCollapsed, onClose }) {
  const user = useSelector(selectUser);
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const [openSectionKey, setOpenSectionKey] = useState("general");
  const [openFlyoutSectionKey, setOpenFlyoutSectionKey] = useState(null);
  const isSidebarCompact = isCollapsed && isDesktop;

  const menuItems = [
    {
      to: "/portal",
      label: "Início",
      icon: faHouse,
      section: "general",
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
        "ceo",
        "dono",
      ],
    },
    {
      to: "/portals",
      label: "Portais",
      icon: faGlobe,
      section: "general",
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
        "ceo",
        "dono",
      ],
    },
    {
      to: "/portal/portals",
      label: "Gerenciar Portais",
      icon: faFolderOpen,
      section: "management",
      checkAllPath: false,
      userTypes: ["1"],
    },
    {
      to: "/portal/users",
      label: "Gerenciar Usuários",
      icon: faUsersGear,
      section: "management",
      checkAllPath: false,
      userTypes: ["1"],
    },
    {
      to: "/portal/roles",
      label: "Roles",
      icon: faShieldHalved,
      section: "management",
      checkAllPath: false,
      userTypes: ["1"],
    },
    {
      to: `/portal/editProfile/${user?._id || ""}`,
      label: "Editar Perfil",
      icon: faPenToSquare,
      section: "general",
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
        "ceo",
        "dono",
      ],
    },
    {
      to: "/diary",
      label: "Agenda Eletrônica",
      icon: faAddressBook,
      section: "general",
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
        "ceo",
        "dono",
      ],
    },
    {
      to: "/portal/addresses",
      label: "Endereços",
      icon: faLocationDot,
      section: "general",
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
        "ceo",
        "dono",
      ],
    },
    {
      to: "/portal/centro-custo/funcionarios",
      label: "Funcionários",
      icon: faUsers,
      section: "costCenter",
      checkAllPath: false,
      canShow: canManageCentrosCusto,
    },
    {
      to: "/portal/centro-custo/centros-custo",
      label: "Centros de Custo",
      icon: faSitemap,
      section: "costCenter",
      checkAllPath: false,
      canShow: canManageCentrosCusto,
    },
    {
      to: "/portal/centro-custo/registrar-movimentacao",
      label: "Registrar Movimentação",
      icon: faRightLeft,
      section: "costCenter",
      checkAllPath: false,
      canShow: canManageCentrosCusto,
    },
    {
      to: "/portal/centro-custo/movimentacoes",
      label: "Movimentações RH",
      icon: faClipboardList,
      section: "costCenter",
      checkAllPath: false,
      canShow: canManageCentrosCusto,
    },
    {
      to: "/portal/plates",
      label: "Gestão de Placas",
      icon: faCarSide,
      section: "general",
      checkAllPath: false,
      userTypes: [
        "1",
        "admin",
        "gerente_frota",
        "auxiliar_frota",
        "coordenador",
        "frota",
      ],
    },
    {
      to: "/contratos",
      label: "Contratos",
      icon: faFileContract,
      section: "contracts",
      checkAllPath: false,
      canShow: canAccessContracts,
    },
    {
      to: "/boletins",
      label: "Boletins",
      icon: faSackDollar,
      section: "contracts",
      checkAllPath: false,
      canShow: canAccessBoletins,
    },
    {
      to: "/resumo-contratos",
      label: "Resumo Contratos",
      icon: faFileInvoiceDollar,
      section: "contracts",
      checkAllPath: false,
      canShow: canAccessResumoContratos,
    },
    {
      to: "/portal/tutorials",
      label: "Tutoriais",
      icon: faBookOpen,
      section: "general",
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
        "ceo",
        "dono",
      ],
    },
    {
      to: "/portal/chatbot",
      label: "Chatbot de Frota (BETA)",
      icon: faRobot,
      section: "general",
      checkAllPath: false,
      userTypes: ["1", "ceo", "dono"],
    },
  ];

  const isAdmin = userIsAdmin(user);
  const visibleItems = user?._id
    ? menuItems.filter((item) => canShowMenuItem(item, user))
    : [];
  const sidebarSections = menuSections
    .map((section) => ({
      ...section,
      items: visibleItems.filter((item) => item.section === section.key),
    }))
    .filter((section) => section.items.length > 0);
  const activeSectionKey = isAdmin
    ? sidebarSections.find((section) =>
        section.items.some((item) => isMenuItemActive(item, location.pathname)),
      )?.key
    : null;

  useEffect(() => {
    if (!isAdmin) return;

    setOpenSectionKey(activeSectionKey || "general");
  }, [activeSectionKey, isAdmin]);

  useEffect(() => {
    setOpenFlyoutSectionKey(null);
  }, [isSidebarCompact, location.pathname]);

  if (!user?._id) return null;

  const handleToggleSection = (sectionKey) => {
    if (isSidebarCompact) {
      setOpenFlyoutSectionKey((currentValue) =>
        currentValue === sectionKey ? null : sectionKey,
      );
      return;
    }

    setOpenSectionKey((currentValue) =>
      currentValue === sectionKey ? null : sectionKey,
    );
  };

  return (
    <SidebarStyled
      className="bg-dark text-white d-flex flex-column"
      $isOpen={isOpen}
      $collapsed={isSidebarCompact}
    >
      <CloseButton
        variant="white"
        onClick={onClose}
        className="ms-auto d-lg-none"
      />
      <BrandRow $collapsed={isSidebarCompact}>
        <BrandLink as={Link} to="/portal" $collapsed={isSidebarCompact}>
          <BrandLogo
            src={CifraLogoWhite}
            alt="Cifra"
            $variant="full"
            $collapsed={isSidebarCompact}
          />
          <BrandLogo
            src={CifraLogoMark}
            alt="Cifra"
            $variant="mark"
            $collapsed={isSidebarCompact}
          />
        </BrandLink>
      </BrandRow>
      <hr />
      <SidebarNav
        variant="pills"
        className="flex-column"
        $collapsed={isSidebarCompact}
      >
        {isAdmin
          ? sidebarSections.map((section) => (
              <SidebarGroup
                key={section.key}
                section={section}
                isCollapsed={isSidebarCompact}
                isOpen={
                  isSidebarCompact
                    ? openFlyoutSectionKey === section.key
                    : openSectionKey === section.key
                }
                isActive={activeSectionKey === section.key}
                onToggle={() => handleToggleSection(section.key)}
                onClose={() => setOpenFlyoutSectionKey(null)}
              />
            ))
          : visibleItems.map((item) => (
              <SidebarItem
                key={item.to}
                item={item}
                isCollapsed={isSidebarCompact}
              />
            ))}
      </SidebarNav>
      <SidebarInstitutionalMenu isCollapsed={isSidebarCompact} />
    </SidebarStyled>
  );
}

const SidebarStyled = styled.header`
  width: ${(props) => (props.$collapsed ? "84px" : "280px")};
  flex: 0 0 ${(props) => (props.$collapsed ? "84px" : "280px")};
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 1020;
  align-self: flex-start;
  height: 100vh;
  padding: ${(props) => (props.$collapsed ? "1rem 0.75rem" : "1rem")};
  overflow-y: auto;
  transition:
    width 180ms ease-out,
    flex-basis 180ms ease-out,
    padding 180ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @media (max-width: 991px) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    flex-basis: 100%;
    height: 100vh;
    padding: 1rem;
    margin-left: 100%;
    transition: all 0.2s linear;

    ${(props) =>
      props.$isOpen &&
      `
            margin-left: 0;
        `}
  }
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${(props) =>
    props.$collapsed ? "center" : "space-between"};
  gap: 0.75rem;
  min-height: 44px;

  @media (min-width: 992px) {
    flex-direction: row;
  }

  @media (max-width: 991px) {
    justify-content: flex-start;
  }
`;

const BrandLink = styled(Nav.Link)`
  display: inline-flex;
  align-items: center;
  justify-content: ${(props) => (props.$collapsed ? "center" : "flex-start")};
  width: fit-content;
  padding: 0;

  @media (max-width: 991px) {
    justify-content: flex-start;
  }
`;

const BrandLogo = styled.img`
  display: ${(props) => {
    if (props.$variant === "mark") {
      return props.$collapsed ? "block" : "none";
    }

    return props.$collapsed ? "none" : "block";
  }};
  width: ${(props) => (props.$variant === "mark" ? "42px" : "200px")};
  max-width: 100%;
  height: auto;
  object-fit: contain;

  @media (max-width: 991px) {
    display: ${(props) => (props.$variant === "mark" ? "none" : "block")};
    width: ${(props) => (props.$variant === "mark" ? "42px" : "200px")};
  }
`;

const SidebarNav = styled(Nav)`
  gap: 0.125rem;

  @media (min-width: 992px) {
    align-items: ${(props) => (props.$collapsed ? "stretch" : "initial")};
  }
`;
