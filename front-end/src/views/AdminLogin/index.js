import styled from "styled-components";
import { AdminAuthForm } from "../../components/AdminAuthForm/idenx";
import Logo from "../../assets/img/logo-cifra.png";

export function AdminLoginView() {
  return (
    <Background className="bg-secondary bg-gradient">
      <Div className="bg-white rounded p-3 p-md-5">
        <DivImage>
          <a href="/">
            <img src={Logo} alt="logo da cifra" />
          </a>
        </DivImage>
        <AdminAuthForm />
      </Div>
    </Background>
  );
}

const Background = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
`;

const Div = styled.div`
  width: 30%;
`;

const DivImage = styled.div`
  width: 100%;
  margin-bottom: 2rem;

  & a {
    display: flex;
    justify-content: center;
  }

  & a img {
    width: 50%;
  }
`;
