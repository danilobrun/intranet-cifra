import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { WEEK_DAYS } from "../constants";
import { CalendarEventItem } from "./CalendarEventItem";

export function WeekCalendar({
  eventsByDate,
  eventsError,
  isLoadingEvents,
  periodTitle,
  visibleEventCount,
  weekDays,
  onDayClick,
  onEventClick,
}) {
  return (
    <WeekPanel>
      <WeekHeader>
        <CalendarTitleGroup>
          <CalendarTitle>Visualização semanal</CalendarTitle>
          {isLoadingEvents ? (
            <LoadingStatus role="status" aria-live="polite">
              <FontAwesomeIcon icon={faCircleNotch} spin />
              Atualizando
            </LoadingStatus>
          ) : null}
          {!isLoadingEvents && eventsError ? (
            <ErrorStatus role="alert">{eventsError}</ErrorStatus>
          ) : null}
        </CalendarTitleGroup>

        <CalendarMeta>{visibleEventCount} evento(s)</CalendarMeta>
      </WeekHeader>

      <WeekScroll>
        <WeekGrid aria-label={`Semana de ${periodTitle}`}>
          {weekDays.map((day, index) => (
            <WeekDayColumn
              key={day.key}
              day={day}
              events={eventsByDate[day.dateKey] || []}
              weekDayLabel={WEEK_DAYS[index]}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
            />
          ))}
        </WeekGrid>
      </WeekScroll>
    </WeekPanel>
  );
}

function WeekDayColumn({
  day,
  events,
  weekDayLabel,
  onDayClick,
  onEventClick,
}) {
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
    <DayColumn
      role="button"
      tabIndex={0}
      aria-label={`Criar evento em ${day.dateKey}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <DayHeader>
        <DayName>{weekDayLabel}</DayName>
        <DayNumber $today={day.isToday}>{day.dayNumber}</DayNumber>
      </DayHeader>

      {events.length ? (
        <EventsList>
          {events.map((event) => (
            <CalendarEventItem
              key={`${event.id}-${event.occurrenceDate}`}
              event={event}
              onEventClick={onEventClick}
            />
          ))}
        </EventsList>
      ) : (
        <EmptyDay>Sem eventos</EmptyDay>
      )}
    </DayColumn>
  );
}

const WeekPanel = styled.section`
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  overflow: hidden;
`;

const WeekHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px 18px;
  border-bottom: 1px solid oklch(90% 0.009 245);
  background: oklch(98% 0.004 245);
`;

const CalendarTitleGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-wrap: wrap;
`;

const CalendarTitle = styled.h2`
  margin: 0;
  color: oklch(24% 0.018 245);
  font-size: 1rem;
  font-weight: 760;
`;

const LoadingStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: oklch(49% 0.018 245);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1;
`;

const ErrorStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: oklch(48% 0.12 25);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.25;

  &::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: oklch(58% 0.18 25);
  }
`;

const CalendarMeta = styled.span`
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  font-weight: 650;
`;

const WeekScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(154px, 1fr));
  min-width: 1078px;
`;

const DayColumn = styled.div`
  display: grid;
  align-content: start;
  gap: 10px;
  min-height: 330px;
  padding: 12px;
  border-right: 1px solid oklch(92% 0.006 245);
  background: oklch(99% 0.004 245);
  cursor: pointer;

  &:nth-child(7n) {
    border-right: 0;
  }

  &:hover,
  &:focus-visible {
    background: oklch(97% 0.006 245);
    outline: none;
  }

  &:focus-visible {
    box-shadow: inset 0 0 0 2px oklch(55% 0.17 253 / 0.45);
  }

  @media (max-width: 767.98px) {
    min-height: 260px;
  }
`;

const DayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const DayName = styled.span`
  color: oklch(42% 0.018 245);
  font-size: 0.82rem;
  font-weight: 760;
`;

const DayNumber = styled.span`
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: ${({ $today }) =>
    $today ? "oklch(54% 0.19 253)" : "oklch(94% 0.006 245)"};
  color: ${({ $today }) =>
    $today ? "oklch(98% 0.004 245)" : "oklch(32% 0.018 245)"};
  font-size: 0.9rem;
  font-weight: 760;
`;

const EventsList = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

const EmptyDay = styled.span`
  display: inline-flex;
  width: fit-content;
  padding: 5px 8px;
  border-radius: 999px;
  background: oklch(96% 0.006 245);
  color: oklch(52% 0.018 245);
  font-size: 0.78rem;
  font-weight: 700;
`;
