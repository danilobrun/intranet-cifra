import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export function PortalHeader({
  title,
  description,
  buttonText,
  buttonLink,
  onButtonClick,
  children,
}) {
  const hasButton = buttonText && (buttonLink || onButtonClick);
  const hasActions = hasButton || children;

  return (
    <HeaderRow>
      <HeaderContent>
        <h1 className="mb-0">{title}</h1>
        {description ? <Description>{description}</Description> : null}
      </HeaderContent>
      {hasActions ? (
        <HeaderActions>
          {hasButton && buttonLink ? (
            <ActionButton to={buttonLink}>
              <FontAwesomeIcon icon={faPlus} />
              {buttonText}
            </ActionButton>
          ) : null}
          {hasButton && onButtonClick ? (
            <ActionNativeButton type="button" onClick={onButtonClick}>
              <FontAwesomeIcon icon={faPlus} />
              {buttonText}
            </ActionNativeButton>
          ) : null}
          {children}
        </HeaderActions>
      ) : null}
    </HeaderRow>
  );
}

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin: 24px 0 12px;
`;

const HeaderContent = styled.div`
  min-width: 240px;
`;

const Description = styled.p`
  margin: 8px 0 0;
  color: #6c757d;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex: 1 1 420px;

  @media (max-width: 767.98px) {
    width: 100%;
    flex-basis: 100%;
    justify-content: stretch;
    flex-wrap: wrap;
  }
`;

const actionButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 9px 16px;
  border: 1px solid #0d6efd;
  border-radius: 10px;
  background: #0d6efd;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 8px 18px rgba(13, 110, 253, 0.18);
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover {
    border-color: #0b5ed7;
    background: #0b5ed7;
    color: #ffffff;
    box-shadow: 0 10px 22px rgba(13, 110, 253, 0.22);
    transform: translateY(-1px);
  }

  &:focus {
    color: #ffffff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.22);
  }

  @media (max-width: 767.98px) {
    flex: 1 1 150px;
  }
`;

const ActionButton = styled(Link)`
  ${actionButtonStyles}
`;

const ActionNativeButton = styled.button`
  ${actionButtonStyles}
`;
