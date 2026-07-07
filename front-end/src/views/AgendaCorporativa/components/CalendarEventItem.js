import styled from "styled-components";

const getTimeLabel = (event) => {
  if (event.diaInteiro) {
    return "Dia inteiro";
  }

  if (event.occurrenceType === "start") {
    return event.horaInicio ? `Início ${event.horaInicio}` : "Início";
  }

  if (event.occurrenceType === "middle") {
    return "Continuação";
  }

  if (event.occurrenceType === "end") {
    return event.horaFim ? `Até ${event.horaFim}` : "Encerramento";
  }

  if (event.horaInicio && event.horaFim) {
    return `${event.horaInicio} às ${event.horaFim}`;
  }

  return event.horaInicio || "";
};

export function CalendarEventItem({ event, onEventClick }) {
  const timeLabel = getTimeLabel(event);

  const handleClick = (clickEvent) => {
    clickEvent.stopPropagation();
    onEventClick?.(event);
  };

  return (
    <EventItem
      type="button"
      title={`${event.titulo} | ${event.status}`}
      data-event-id={event.id}
      data-occurrence-date={event.occurrenceDate}
      onClick={handleClick}
    >
      <EventMarker aria-hidden="true" />
      <EventContent>
        {timeLabel ? <EventTime>{timeLabel}</EventTime> : null}
        <EventTitle>{event.titulo}</EventTitle>
      </EventContent>
    </EventItem>
  );
}

const EventItem = styled.button`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 7px;
  align-items: start;
  min-width: 0;
  width: 100%;
  padding: 6px 7px;
  border: 1px solid oklch(88% 0.012 245);
  border-radius: 7px;
  background: oklch(98% 0.004 245);
  color: oklch(28% 0.016 245);
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    outline: none;
  }

  &:focus-visible {
    box-shadow: 0 0 0 0.16rem oklch(55% 0.17 253 / 0.14);
  }
`;

const EventMarker = styled.span`
  width: 7px;
  height: 7px;
  margin-top: 5px;
  border-radius: 999px;
  background: oklch(58% 0.014 245);
`;

const EventContent = styled.span`
  display: grid;
  min-width: 0;
  gap: 2px;
`;

const EventTime = styled.span`
  color: oklch(42% 0.018 245);
  font-size: 0.7rem;
  font-weight: 760;
  line-height: 1.2;
`;

const EventTitle = styled.span`
  color: oklch(25% 0.018 245);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
