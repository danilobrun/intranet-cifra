import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faPlus } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

export function TutorialListHeader({ isAdmin }) {
  return (
    <HeaderRow>
      <HeaderContent>
        <IconFrame aria-hidden="true">
          <FontAwesomeIcon icon={faBookOpen} />
        </IconFrame>
        <TitleGroup>
          <Title>Tutoriais</Title>
          <Description>
            Consulte procedimentos internos em formato de passo a passo.
          </Description>
        </TitleGroup>
      </HeaderContent>

      {isAdmin ? (
        <PrimaryAction to="/portal/tutorials/new">
          <FontAwesomeIcon icon={faPlus} />
          Novo tutorial
        </PrimaryAction>
      ) : null}
    </HeaderRow>
  );
}

const HeaderRow = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 24px 0 18px;
  flex-wrap: wrap;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
`;

const IconFrame = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  min-width: 46px;
  height: 46px;
  border: 1px solid oklch(85% 0.026 253);
  border-radius: 12px;
  background: oklch(97% 0.018 253);
  color: oklch(42% 0.16 253);
  font-size: 1.15rem;
`;

const TitleGroup = styled.div`
  min-width: 0;
`;

const Title = styled.h1`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: 2.25rem;
  font-weight: 760;
  line-height: 1.15;
  letter-spacing: 0;

  @media (max-width: 575.98px) {
    font-size: 1.85rem;
  }
`;

const Description = styled.p`
  max-width: 620px;
  margin: 8px 0 0;
  color: oklch(49% 0.018 245);
  font-size: 1rem;
  line-height: 1.5;
`;

const PrimaryAction = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid oklch(54% 0.19 253);
  border-radius: 10px;
  background: oklch(54% 0.19 253);
  color: oklch(98% 0.004 240);
  font-size: 0.95rem;
  font-weight: 720;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 10px 22px oklch(42% 0.18 253 / 0.2);
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover,
  &:focus {
    border-color: oklch(48% 0.2 253);
    background: oklch(48% 0.2 253);
    color: oklch(98% 0.004 240);
    text-decoration: none;
    box-shadow: 0 12px 26px oklch(42% 0.18 253 / 0.24);
    transform: translateY(-1px);
  }

  @media (max-width: 575.98px) {
    width: 100%;
  }
`;
