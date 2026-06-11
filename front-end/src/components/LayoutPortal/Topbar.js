import { useEffect, useMemo, useState } from "react";
import { Container, Dropdown, Nav, Navbar } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";
import DropdownToggle from "react-bootstrap/esm/DropdownToggle";
import NavbarToggle from "react-bootstrap/esm/NavbarToggle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {
  getCachedMyAvatarUrl,
  getMyAvatarUrl,
  logout,
} from "../../services/Users.service";
import { useNavigate } from "react-router-dom";
import { userLogout } from "../../store/User/User.actions";
import { selectUser } from "../../store/User/User.selectors";
import { getTimeGreeting } from "../../helpers/getTimeGreeting";

const getInitials = (name = "") => {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "U";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

export function Topbar({
  onOpen,
  isSidebarCollapsed,
  onToggleSidebarCollapsed,
}) {
  const user = useSelector(selectUser);
  const userId = user?._id;
  const [avatarUrl, setAvatarUrl] = useState(() =>
    getCachedMyAvatarUrl(userId),
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userName = user?.name || "Usuario";
  const userInitials = useMemo(() => getInitials(userName), [userName]);
  const userNameText = userName.toUpperCase();
  const userGreeting = `${getTimeGreeting()}, ${userNameText}`;

  useEffect(() => {
    let isActive = true;

    if (!userId) {
      setAvatarUrl("");
      return () => {
        isActive = false;
      };
    }

    const loadAvatar = async () => {
      try {
        const cachedAvatarUrl = getCachedMyAvatarUrl(userId);
        setAvatarUrl(cachedAvatarUrl);

        const nextAvatarUrl = await getMyAvatarUrl(userId);

        if (!isActive) {
          return;
        }

        setAvatarUrl(nextAvatarUrl);
      } catch (error) {
        if (isActive) {
          setAvatarUrl("");
        }
      }
    };

    loadAvatar();

    return () => {
      isActive = false;
    };
  }, [userId]);

  const handleLogout = () => {
    logout();
    dispatch(userLogout());
    navigate("/");
  };
  return (
    <Navbar bg="light" expand="lg">
      <Container fluid>
        <SidebarCollapseButton
          type="button"
          className="d-none d-lg-inline-flex"
          aria-label={
            isSidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"
          }
          onClick={onToggleSidebarCollapsed}
          title={
            isSidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"
          }
        >
          <FontAwesomeIcon
            icon={isSidebarCollapsed ? faChevronRight : faChevronLeft}
            aria-hidden="true"
          />
        </SidebarCollapseButton>
        <NavbarToggle onClick={onOpen} />
        <Nav className="ms-auto">
          <Dropdown align="end">
            <UserToggle variant="light">
              <TopbarAvatar aria-hidden="true">
                {avatarUrl ? (
                  <TopbarAvatarImage src={avatarUrl} alt="" />
                ) : (
                  <TopbarAvatarInitials>{userInitials}</TopbarAvatarInitials>
                )}
              </TopbarAvatar>
              <GreetingText>{userGreeting}</GreetingText>
            </UserToggle>
            <MenuStyled>
              <DropdownItem onClick={handleLogout}>Sair</DropdownItem>
            </MenuStyled>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}

const SidebarCollapseButton = styled.button`
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  margin-right: 0.75rem;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 0.375rem;
  background: oklch(99% 0.003 245);
  color: oklch(31% 0.018 245);
  transition:
    background-color 150ms ease-out,
    border-color 150ms ease-out,
    color 150ms ease-out;

  &:hover,
  &:focus {
    background: oklch(96% 0.007 245);
    border-color: oklch(82% 0.014 245);
    color: oklch(22% 0.018 245);
  }

  &:focus-visible {
    outline: 3px solid rgba(13, 110, 253, 0.2);
    outline-offset: 2px;
  }
`;

const UserToggle = styled(DropdownToggle)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 4px 12px 4px 6px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 999px;
  color: oklch(27% 0.016 245);
  font-weight: 700;

  &::after {
    margin-left: 2px;
  }

  &:hover,
  &:focus {
    border-color: oklch(82% 0.014 245);
    color: oklch(22% 0.018 245);
  }
`;

const TopbarAvatar = styled.span`
  width: 34px;
  height: 34px;
  min-width: 34px;
  overflow: hidden;
  display: inline-grid;
  place-items: center;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 50%;
  background: oklch(96% 0.007 245);
`;

const TopbarAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
`;

const TopbarAvatarInitials = styled.span`
  color: oklch(38% 0.026 245);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
`;

const GreetingText = styled.span`
  min-width: 0;
  max-width: min(52vw, 360px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 575.98px) {
    max-width: 46vw;
  }
`;

const MenuStyled = styled(DropdownMenu)`
  position: absolute !important;
`;
