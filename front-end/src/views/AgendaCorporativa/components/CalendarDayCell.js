import styled from "styled-components";
import { MONTH_EVENT_LIMIT } from "../constants";
import { getVisibleEventSummary } from "../utils/events";
import { CalendarEventItem } from "./CalendarEventItem";

export function CalendarDayCell({
  day,
  events = [],
  onDayClick,
  onEventClick,
}) {
  const { visibleEvents, hiddenCount } = getVisibleEventSummary(
    events,
    MONTH_EVENT_LIMIT,
  );

  const handleClick = () => {
    onDayClick?.(day);
  };

  const handleKeyDown = (event) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onDayClick?.(day);
    }
  };

  return (
    <DayCell
      role="gridcell"
      tabIndex={0}
      $muted={!day.isCurrentMonth}
      $today={day.isToday}
      aria-current={day.isToday ? "date" : undefined}
      aria-label={`Criar evento em ${day.dateKey}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <DayHeader>
        <DayNumber $today={day.isToday}>{day.dayNumber}</DayNumber>
      </DayHeader>

      {visibleEvents.length ? (
        <EventsList>
          {visibleEvents.map((event) => (
            <CalendarEventItem
              key={`${event.id}-${event.occurrenceDate}`}
              event={event}
              onEventClick={onEventClick}
            />
          ))}
          {hiddenCount ? (
            <MoreEvents onClick={(event) => event.stopPropagation()}>
              + {hiddenCount} eventos
            </MoreEvents>
          ) : null}
        </EventsList>
      ) : null}
    </DayCell>
  );
}

const DayCell = styled.div`
  display: grid;
  align-content: start;
  gap: 8px;
  box-sizing: border-box;
  height: 184px;
  min-height: 184px;
  width: 100%;
  padding: 10px;
  border: 0;
  border-right: 1px solid oklch(92% 0.006 245);
  border-bottom: 1px solid oklch(92% 0.006 245);
  background: ${({ $today }) =>
    $today ? "oklch(97% 0.014 253)" : "oklch(99% 0.004 245)"};
  color: ${({ $muted }) =>
    $muted ? "oklch(58% 0.014 245)" : "oklch(28% 0.016 245)"};
  font: inherit;
  text-align: left;
  cursor: pointer;
  overflow: hidden;

  &:hover,
  &:focus-visible {
    background: ${({ $today }) =>
      $today ? "oklch(96% 0.018 253)" : "oklch(97% 0.006 245)"};
    outline: none;
  }

  &:focus-visible {
    box-shadow: inset 0 0 0 2px oklch(55% 0.17 253 / 0.45);
  }

  &:nth-child(7n) {
    border-right: 0;
  }
`;

const DayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
`;

const DayNumber = styled.span`
  display: inline-grid;
  place-items: center;
  justify-self: start;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: ${({ $today }) =>
    $today ? "oklch(54% 0.19 253)" : "transparent"};
  color: ${({ $today }) => ($today ? "oklch(98% 0.004 245)" : "inherit")};
  font-size: 0.9rem;
  font-weight: 760;
`;

const EventsList = styled.div`
  display: grid;
  gap: 5px;
  min-width: 0;
  overflow: hidden;
`;

const MoreEvents = styled.span`
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  padding: 3px 7px;
  border-radius: 999px;
  background: oklch(94% 0.006 245);
  color: oklch(42% 0.018 245);
  font-size: 0.73rem;
  font-weight: 760;
  line-height: 1.2;
  white-space: nowrap;
`;
