import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

export function WeatherPanelError({ message }) {
  if (!message) {
    return null;
  }

  return (
    <ErrorAlert variant="warning">
      <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" />
      <span>{message}</span>
    </ErrorAlert>
  );
}

const ErrorAlert = styled(Alert)`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin: 0;
  border-radius: 0.5rem;
  line-height: 1.45;
`;
