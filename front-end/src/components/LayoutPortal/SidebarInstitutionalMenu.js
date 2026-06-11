import { useEffect, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

const institutionalLinks = [
  {
    href: "/codigo-conduta-cifra.pdf",
    label: <>C&oacute;digo de Conduta</>,
    ariaLabel: "Abrir Codigo de Conduta",
  },
  {
    href: "/relatorio-igualdade-salario.pdf",
    label: <>Relat&oacute;rio de Igualdade Salarial</>,
    ariaLabel: "Abrir Relatorio de Igualdade Salarial",
  },
];

const socialLinks = [
  {
    href: "https://www.linkedin.com/company/cifra-engenharia",
    label: "LinkedIn",
    icon: faLinkedin,
  },
  {
    href: "https://www.instagram.com/cifraengenharia",
    label: "Instagram",
    icon: faInstagram,
  },
];

export function SidebarInstitutionalMenu({ isCollapsed }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [isCollapsed]);

  const toggleButton = (
    <ToggleButton
      type="button"
      aria-expanded={isOpen}
      aria-controls="sidebar-institutional-menu"
      aria-label={isCollapsed ? "Abrir menu institucional" : undefined}
      onClick={() => setIsOpen((currentValue) => !currentValue)}
      $collapsed={isCollapsed}
    >
      <ToggleIcon aria-hidden="true" $collapsed={isCollapsed}>
        <FontAwesomeIcon icon={faBars} fixedWidth />
      </ToggleIcon>
      <ToggleText $collapsed={isCollapsed}>Menu</ToggleText>
      <Indicator aria-hidden="true" $isOpen={isOpen} $collapsed={isCollapsed} />
    </ToggleButton>
  );

  return (
    <Wrapper $collapsed={isCollapsed}>
      {isCollapsed ? (
        <OverlayTrigger
          placement="right"
          delay={{ show: 250, hide: 0 }}
          overlay={
            <Tooltip id="sidebar-institutional-menu-tooltip">
              Menu institucional
            </Tooltip>
          }
        >
          {toggleButton}
        </OverlayTrigger>
      ) : (
        toggleButton
      )}

      <Menu
        id="sidebar-institutional-menu"
        hidden={!isOpen}
        $collapsed={isCollapsed}
      >
        <LinkGroup>
          {institutionalLinks.map((link) => (
            <MenuLink
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.ariaLabel}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </MenuLink>
          ))}
        </LinkGroup>

        <SocialGroup aria-label="Redes sociais">
          {socialLinks.map((link) => (
            <SocialLink
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon icon={link.icon} aria-hidden="true" />
              <span>{link.label}</span>
            </SocialLink>
          ))}
        </SocialGroup>
      </Menu>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  margin-top: auto;
  padding-top: ${(props) => (props.$collapsed ? "0.85rem" : "1rem")};
  border-top: 1px solid rgba(255, 255, 255, 0.16);
`;

const ToggleButton = styled.button`
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$collapsed ? "center" : "space-between")};
  gap: ${(props) => (props.$collapsed ? "0" : "0.75rem")};
  padding: ${(props) => (props.$collapsed ? "0.5rem 0" : "0.5rem 0.75rem")};
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 0.375rem;
  background: transparent;
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  text-align: left;
  transition:
    background-color 150ms ease-out,
    border-color 150ms ease-out;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.32);
  }

  &:focus-visible {
    outline: 3px solid rgba(255, 255, 255, 0.45);
    outline-offset: 2px;
  }

  @media (max-width: 991px) {
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
`;

const ToggleIcon = styled.span`
  display: ${(props) => (props.$collapsed ? "inline-flex" : "none")};
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;

  @media (max-width: 991px) {
    display: none;
  }
`;

const ToggleText = styled.span`
  max-width: ${(props) => (props.$collapsed ? "0" : "120px")};
  overflow: hidden;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  white-space: nowrap;
  transition:
    max-width 150ms ease-out,
    opacity 120ms ease-out;

  @media (max-width: 991px) {
    max-width: 120px;
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Indicator = styled.span`
  flex: 0 0 auto;
  display: ${(props) => (props.$collapsed ? "none" : "block")};
  position: relative;
  top: ${(props) => (props.$isOpen ? "-1px" : "1px")};
  width: 0.55rem;
  height: 0.55rem;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(${(props) => (props.$isOpen ? "45deg" : "225deg")});
  transition:
    top 150ms ease-out,
    transform 150ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @media (max-width: 991px) {
    display: block;
  }
`;

const Menu = styled.div`
  display: grid;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  background: #ffffff;
  box-shadow: 0 18px 42px rgba(17, 24, 39, 0.18);

  &[hidden] {
    display: none;
  }

  @media (min-width: 992px) {
    position: ${(props) => (props.$collapsed ? "fixed" : "absolute")};
    ${(props) =>
      props.$collapsed
        ? `
            left: 92px;
            right: auto;
            bottom: 1rem;
            width: 280px;
            z-index: 1100;
          `
        : `
            right: 0;
            bottom: calc(100% + 0.75rem);
            left: 0;
            z-index: 2;
          `}
    margin-top: 0;
  }
`;

const LinkGroup = styled.div`
  display: grid;
  gap: 0.25rem;
`;

const MenuLink = styled.a`
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  color: #212529;
  text-decoration: none;
  transition:
    background-color 150ms ease-out,
    color 150ms ease-out;

  &:hover {
    background: #f8f9fa;
    color: #0d6efd;
  }

  &:focus-visible {
    outline: 3px solid rgba(13, 110, 253, 0.28);
    outline-offset: 2px;
  }
`;

const SocialGroup = styled.nav`
  display: grid;
  gap: 0.25rem;
  padding-top: 0.5rem;
  border-top: 1px solid #dee2e6;
`;

const SocialLink = styled.a`
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  color: #212529;
  text-decoration: none;
  transition:
    background-color 150ms ease-out,
    color 150ms ease-out;

  svg {
    width: 1rem;
  }

  &:hover {
    background: #f8f9fa;
    color: #0d6efd;
  }

  &:focus-visible {
    outline: 3px solid rgba(13, 110, 253, 0.28);
    outline-offset: 2px;
  }
`;
