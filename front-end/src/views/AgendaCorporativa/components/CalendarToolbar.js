import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import styled, { css } from "styled-components";
import { VIEW_OPTIONS } from "../constants";

export function CalendarToolbar({
  periodTitle,
  selectedView,
  onViewChange,
  onGoToToday,
  onPreviousMonth,
  onNextMonth,
  onCreateEvent,
}) {
  return (
    <ToolbarPanel>
      <PeriodControls aria-label="Navegação do calendário">
        <TodayButton type="button" onClick={onGoToToday}>
          Hoje
        </TodayButton>
        <IconButton
          type="button"
          aria-label="Período anterior"
          onClick={onPreviousMonth}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </IconButton>
        <PeriodTitle aria-live="polite">{periodTitle}</PeriodTitle>
        <IconButton
          type="button"
          aria-label="Próximo período"
          onClick={onNextMonth}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </IconButton>
      </PeriodControls>

      <ToolbarActions>
        <ViewSelector aria-label="Selecionar visualização">
          {VIEW_OPTIONS.map((viewOption) => (
            <ViewButton
              key={viewOption}
              type="button"
              $active={selectedView === viewOption}
              aria-pressed={selectedView === viewOption}
              onClick={() => onViewChange(viewOption)}
            >
              {viewOption}
            </ViewButton>
          ))}
        </ViewSelector>

        <PrimaryAction type="button" onClick={onCreateEvent}>
          <FontAwesomeIcon icon={faPlus} />
          Novo Evento
        </PrimaryAction>
      </ToolbarActions>
    </ToolbarPanel>
  );
}

const interactiveControl = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.14);
  }
`;

const ToolbarPanel = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin: 18px 0;
  padding: 18px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
`;

const PeriodControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-wrap: wrap;
`;

const TodayButton = styled.button`
  ${interactiveControl}
  padding: 0 14px;
  border: 1px solid oklch(86% 0.012 245);
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    outline: none;
  }
`;

const IconButton = styled.button`
  ${interactiveControl}
  width: 40px;
  padding: 0;
  border: 1px solid oklch(86% 0.012 245);
  background: oklch(99% 0.004 245);
  color: oklch(34% 0.018 245);

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    outline: none;
  }
`;

const PeriodTitle = styled.h2`
  min-width: 190px;
  margin: 0;
  color: oklch(24% 0.018 245);
  font-size: 1.15rem;
  font-weight: 760;
  text-align: center;

  @media (max-width: 575.98px) {
    order: -1;
    width: 100%;
    text-align: left;
  }
`;

const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 767.98px) {
    width: 100%;
    justify-content: stretch;
  }
`;

const ViewSelector = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 10px;
  background: oklch(96% 0.006 245);

  @media (max-width: 767.98px) {
    flex: 1 1 100%;
    overflow-x: auto;
  }
`;

const ViewButton = styled.button`
  ${interactiveControl}
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: ${({ $active }) =>
    $active ? "oklch(99% 0.004 245)" : "transparent"};
  color: ${({ $active }) =>
    $active ? "oklch(30% 0.06 253)" : "oklch(42% 0.018 245)"};
  box-shadow: ${({ $active }) =>
    $active ? "0 1px 3px oklch(18% 0.018 245 / 0.12)" : "none"};

  &:hover,
  &:focus {
    color: oklch(24% 0.018 245);
    background: oklch(99% 0.004 245);
    outline: none;
  }

  @media (max-width: 767.98px) {
    flex: 1 0 auto;
  }
`;

const PrimaryAction = styled.button`
  ${interactiveControl}
  padding: 0 16px;
  border: 1px solid #0d6efd;
  background: #0d6efd;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(13, 110, 253, 0.18);

  &:hover,
  &:focus {
    border-color: #0b5ed7;
    background: #0b5ed7;
    color: #ffffff;
    outline: none;
  }

  @media (max-width: 767.98px) {
    flex: 1 1 180px;
  }
`;

