import styled from "styled-components";
import { RegisterForm } from "./RegisterForm";

export function AdminAuthForm({ redirectAfterLogin = true }) {
  return (
    <Div>
      <RegisterForm redirectAfterLogin={redirectAfterLogin} />
    </Div>
  );
}

const Div = styled.div``;
