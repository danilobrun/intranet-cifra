import styled from "styled-components";

export function DashboardWelcomeHeader({ userName }) {
  return (
    <Header>
      <Title>Bem-vindo(a), {userName}</Title>
      <Description>
        Acompanhe as informações do dia e consulte o clima da sua localidade.
      </Description>
    </Header>
  );
}

const Header = styled.header`
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  margin: 0;
  color: oklch(24% 0.018 245);
  font-size: 2.5rem;
  font-weight: 500;
  line-height: 1.2;

  @media (max-width: 575px) {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  max-width: 68ch;
  margin: 0;
  color: oklch(47% 0.018 245);
  font-size: 1rem;
  line-height: 1.5;
`;
