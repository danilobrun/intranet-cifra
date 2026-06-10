import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

export function ChatbotHeader() {
  return (
    <div>
      <Title className="mb-2">
        <TitleIcon icon={faRobot} aria-hidden="true" />
        Chatbot de Frota
      </Title>
      <p className="text-muted mb-0">
        Um espaço único para conversar com o assistente e acompanhar demandas do
        portal.
      </p>
    </div>
  );
}

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TitleIcon = styled(FontAwesomeIcon)`
  color: #6c757d;
  font-size: 1.35rem;
`;
