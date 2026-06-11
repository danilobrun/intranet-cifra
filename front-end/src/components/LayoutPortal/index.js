import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import styled from "styled-components";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "cifra-sidebar-collapsed";

const getStoredSidebarCollapsed = () => {
  try {
    return (
      window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true"
    );
  } catch {
    return false;
  }
};

export function LayoutPortal({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    getStoredSidebarCollapsed,
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SIDEBAR_COLLAPSED_STORAGE_KEY,
        String(isSidebarCollapsed),
      );
    } catch {
      // A preferencia visual continua funcionando na sessao atual.
    }
  }, [isSidebarCollapsed]);

  const handleToggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((currentValue) => !currentValue);
  };

  return (
    <div className="d-flex flex-grow-1">
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
      />
      <ContentStyled className="flex-grow-1">
        <Topbar
          onOpen={() => setIsSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapsed={handleToggleSidebarCollapsed}
        />
        <Container fluid>{children}</Container>
      </ContentStyled>
    </div>
  );
}

const ContentStyled = styled.main`
  min-width: 0;
`;
