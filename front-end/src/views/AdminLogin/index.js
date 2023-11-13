import { Container } from "react-bootstrap";
import styled from "styled-components";
import { AdminAuthForm } from "../../components/AdminAuthForm/idenx";

export function AdminLoginView() {
  return (
    <Background className="bg-secondary bg-gradient">
      <Container className="bg-white rounded p-3 p-md-5">
        <AdminAuthForm />
      </Container>
    </Background>
  );
}

const Background = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
`;
