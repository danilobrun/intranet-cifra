import { NavItem } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation, useResolvedPath } from "react-router-dom";
import styled from "styled-components";

const normalizePath = (path) => path.replace(/\/+$/, "") || "/";

export function SidebarItem({ item }) {
  const { pathname } = useResolvedPath(item.to);
  const location = useLocation();
  const currentPath = normalizePath(location.pathname);
  const targetPath = normalizePath(pathname);
  const isActive = item.checkAllPath
    ? currentPath === targetPath
    : currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);

  return (
    <NavItem>
      <SidebarNavLink
        to={item.to}
        $active={isActive}
        aria-current={isActive ? "page" : undefined}
      >
        <ItemIcon aria-hidden="true">
          <FontAwesomeIcon icon={item.icon} fixedWidth />
        </ItemIcon>
        <ItemLabel>{item.label}</ItemLabel>
      </SidebarNavLink>
    </NavItem>
  );
}

const SidebarNavLink = styled(Link)`
  && {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 42px;
    padding: 0.625rem 0.75rem;
    border-radius: 8px;
    background: ${(props) => (props.$active ? "#0d6efd" : "transparent")};
    color: ${(props) =>
      props.$active ? "#ffffff" : "rgba(248, 249, 250, 0.86)"};
    font-weight: ${(props) => (props.$active ? 700 : 600)};
    line-height: 1.2;
    text-decoration: none;
    transition:
      background-color 180ms ease-out,
      color 180ms ease-out,
      transform 180ms ease-out;

    * {
      text-decoration: none;
    }
  }

  &&:hover,
  &&:focus {
    background: ${(props) =>
      props.$active ? "#0d6efd" : "rgba(248, 249, 250, 0.1)"};
    color: #f8f9fa;
    text-decoration: none;
    transform: ${(props) => (props.$active ? "translateX(0)" : "translateX(2px)")};
  }

  &&:focus-visible {
    outline: 2px solid rgba(248, 249, 250, 0.45);
    outline-offset: 2px;
  }
`;

const ItemIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  min-width: 22px;
  font-size: 0.95rem;
  opacity: 0.95;
`;

const ItemLabel = styled.span`
  min-width: 0;
`;
