import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";
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

export function SidebarInstitutionalMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Wrapper>
      <ToggleButton
        type="button"
        aria-expanded={isOpen}
        aria-controls="sidebar-institutional-menu"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span>Institucional</span>
        <Indicator aria-hidden="true" $isOpen={isOpen} />
      </ToggleButton>

      <Menu id="sidebar-institutional-menu" hidden={!isOpen}>
        <LinkGroup>
          {institutionalLinks.map((link) => (
            <MenuLink
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.ariaLabel}
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
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
`;

const ToggleButton = styled.button`
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 0.375rem;
  background: transparent;
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  text-align: left;
  transition: background-color 150ms ease-out, border-color 150ms ease-out;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.32);
  }

  &:focus-visible {
    outline: 3px solid rgba(255, 255, 255, 0.45);
    outline-offset: 2px;
  }
`;

const Indicator = styled.span`
  flex: 0 0 auto;
  display: block;
  position: relative;
  top: ${(props) => (props.$isOpen ? "-1px" : "1px")};
  width: 0.55rem;
  height: 0.55rem;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(${(props) => (props.$isOpen ? "45deg" : "225deg")});
  transition: top 150ms ease-out, transform 150ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
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
    position: absolute;
    right: 0;
    bottom: calc(100% + 0.75rem);
    left: 0;
    z-index: 2;
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
  transition: background-color 150ms ease-out, color 150ms ease-out;

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
  transition: background-color 150ms ease-out, color 150ms ease-out;

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
