import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { WEEK_DAYS } from "../constants";
import { CalendarDayCell } from "./CalendarDayCell";

export function MonthCalendar({
  calendarDays,
  eventsByDate,
  eventsError,
  isLoadingEvents,
  periodTitle,
  visibleEventCount,
  onDayClick,
  onEventClick,
}) {
  return (
    <CalendarPanel>
      <CalendarHeader>
        <CalendarTitleGroup>
          <CalendarTitle>Visualização mensal</CalendarTitle>
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
        <CalendarMeta>
          {visibleEventCount} evento(s)
        </CalendarMeta>
      </CalendarHeader>

      <CalendarScroll>
        <CalendarGrid role="grid" aria-label={`Calendário de ${periodTitle}`}>
          {WEEK_DAYS.map((weekDay) => (
            <WeekDayCell key={weekDay} role="columnheader">
              {weekDay}
            </WeekDayCell>
          ))}

          {calendarDays.map((day) => (
            <CalendarDayCell
              key={day.key}
              day={day}
              events={eventsByDate[day.dateKey] || []}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
            />
          ))}
        </CalendarGrid>
      </CalendarScroll>
    </CalendarPanel>
  );
}

const CalendarPanel = styled.section`
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px 18px;
  border-bottom: 1px solid oklch(90% 0.009 245);
  background: oklch(98% 0.004 245);
`;

const CalendarTitle = styled.h2`
  margin: 0;
  color: oklch(24% 0.018 245);
  font-size: 1rem;
  font-weight: 760;
`;

const CalendarTitleGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-wrap: wrap;
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

const CalendarScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(136px, 1fr));
  min-width: 952px;
`;

const WeekDayCell = styled.div`
  padding: 12px;
  border-right: 1px solid oklch(91% 0.008 245);
  border-bottom: 1px solid oklch(89% 0.009 245);
  background: oklch(55% 0.014 245);
  color: oklch(98% 0.004 245);
  font-size: 0.82rem;
  font-weight: 760;
  text-align: center;

  &:nth-child(7n) {
    border-right: 0;
  }
`;
