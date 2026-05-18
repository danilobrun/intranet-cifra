import { useState } from "react";
import { Container } from "react-bootstrap";
import styled from "styled-components";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function LayoutPortal ({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    return (
        <div className="d-flex flex-grow-1">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}/>
            <ContentStyled className="flex-grow-1">
                <Topbar onOpen={() => setIsSidebarOpen(true)}/>
                <Container fluid>
                    {children}
                </Container>
            </ContentStyled>
        </div>
    )
}

const ContentStyled = styled.main`
    min-width: 0;
`;
