import { NavItem, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation, useResolvedPath } from "react-router-dom";
import styled from "styled-components";

const normalizePath = (path) => path.replace(/\/+$/, "") || "/";

const getTooltipId = (path) =>
  `sidebar-tooltip-${path.replace(/[^a-zA-Z0-9_-]/g, "-") || "home"}`;

export function SidebarItem({
  item,
  isCollapsed,
  isNested = false,
  onNavigate,
}) {
  const { pathname } = useResolvedPath(item.to);
  const location = useLocation();
  const currentPath = normalizePath(location.pathname);
  const targetPath = normalizePath(pathname);
  const isActive = item.checkAllPath
    ? currentPath === targetPath
    : currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);

  const navLink = (
    <SidebarNavLink
      to={item.to}
      $active={isActive}
      $collapsed={isCollapsed}
      $nested={isNested}
      aria-current={isActive ? "page" : undefined}
      aria-label={isCollapsed ? item.label : undefined}
      onClick={onNavigate}
    >
      <ItemIcon aria-hidden="true" $collapsed={isCollapsed}>
        <FontAwesomeIcon icon={item.icon} fixedWidth />
      </ItemIcon>
      <ItemLabel $collapsed={isCollapsed}>{item.label}</ItemLabel>
    </SidebarNavLink>
  );

  return (
    <NavItem>
      {isCollapsed ? (
        <OverlayTrigger
          placement="right"
          delay={{ show: 250, hide: 0 }}
          overlay={
            <Tooltip id={getTooltipId(targetPath)}>{item.label}</Tooltip>
          }
        >
          {navLink}
        </OverlayTrigger>
      ) : (
        navLink
      )}
    </NavItem>
  );
}

const SidebarNavLink = styled(Link)`
  && {
    display: flex;
    align-items: center;
    justify-content: ${(props) => (props.$collapsed ? "center" : "flex-start")};
    gap: ${(props) => (props.$collapsed ? "0" : "12px")};
    width: 100%;
    min-height: ${(props) => (props.$nested ? "38px" : "42px")};
    padding: ${(props) => {
      if (props.$collapsed) {
        return "0.625rem 0";
      }

      if (props.$nested) {
        return "0.5rem 0.625rem 0.5rem 0.75rem";
      }

      return "0.625rem 0.75rem";
    }};
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
    transform: ${(props) =>
      props.$active ? "translateX(0)" : "translateX(2px)"};
  }

  &&:focus-visible {
    outline: 2px solid rgba(248, 249, 250, 0.45);
    outline-offset: 2px;
  }

  @media (max-width: 991px) {
    justify-content: flex-start;
    gap: 12px;
    padding: ${(props) =>
      props.$nested ? "0.5rem 0.625rem 0.5rem 0.75rem" : "0.625rem 0.75rem"};
  }
`;

const ItemIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => (props.$collapsed ? "100%" : "22px")};
  min-width: 22px;
  font-size: ${(props) => (props.$collapsed ? "1.05rem" : "0.95rem")};
  opacity: 0.95;

  @media (max-width: 991px) {
    width: 22px;
    font-size: 0.95rem;
  }
`;

const ItemLabel = styled.span`
  min-width: 0;
  max-width: ${(props) => (props.$collapsed ? "0" : "190px")};
  overflow: hidden;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  white-space: nowrap;
  transition:
    max-width 150ms ease-out,
    opacity 120ms ease-out;

  @media (max-width: 991px) {
    max-width: 190px;
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
