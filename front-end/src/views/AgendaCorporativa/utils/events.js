import { toDateKey } from "./calendar";

const getEventStartComparable = (event) =>
  `${event.dataInicio || ""} ${event.horaInicio || "00:00"}`;

const normalizeDateKey = (value) => {
  const textValue = String(value || "");

  if (/^\d{4}-\d{2}-\d{2}$/.test(textValue)) {
    return textValue;
  }

  const date = new Date(textValue);

  if (!Number.isNaN(date.getTime())) {
    return toDateKey(date);
  }

  return textValue.slice(0, 10);
};

const normalizeTime = (value) => {
  if (!value || /^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getEventStartDateKey = (event) => normalizeDateKey(event.dataInicio);

const getEventEndDateKey = (event) =>
  normalizeDateKey(event.dataFim || event.dataInicio);

export const eventOccursOnDate = (event, dateKey) => {
  const startDateKey = getEventStartDateKey(event);
  const endDateKey = getEventEndDateKey(event);

  return startDateKey <= dateKey && dateKey <= endDateKey;
};

export const getEventOccurrenceType = (event, dateKey) => {
  const startDateKey = getEventStartDateKey(event);
  const endDateKey = getEventEndDateKey(event);

  if (startDateKey === endDateKey) {
    return "single";
  }

  if (dateKey === startDateKey) {
    return "start";
  }

  if (dateKey === endDateKey) {
    return "end";
  }

  return "middle";
};

export const buildEventOccurrence = (event, dateKey) => ({
  ...event,
  occurrenceDate: dateKey,
  occurrenceType: getEventOccurrenceType(event, dateKey),
});

const sortEvents = (firstEvent, secondEvent) => {
  if (firstEvent.diaInteiro !== secondEvent.diaInteiro) {
    return firstEvent.diaInteiro ? -1 : 1;
  }

  return getEventStartComparable(firstEvent).localeCompare(
    getEventStartComparable(secondEvent),
  );
};

export const mapApiEventToCalendarEvent = (event) => {
  const id = event.id || event._id;

  return {
    ...event,
    id,
    dataInicioOriginal: event.dataInicio,
    dataFimOriginal: event.dataFim || event.dataInicio,
    dataInicio: normalizeDateKey(event.dataInicio),
    dataFim: normalizeDateKey(event.dataFim || event.dataInicio),
    horaInicio: event.diaInteiro ? "" : normalizeTime(event.dataInicio),
    horaFim: event.diaInteiro ? "" : normalizeTime(event.dataFim),
  };
};

export const mapApiEventsToCalendarEvents = (events = []) =>
  events.map(mapApiEventToCalendarEvent);

export const groupEventsByCalendarDay = (events, calendarDays) =>
  calendarDays.reduce((eventsByDate, day) => {
    const dayEvents = events
      .filter((event) => eventOccursOnDate(event, day.dateKey))
      .map((event) => buildEventOccurrence(event, day.dateKey))
      .sort(sortEvents);

    return {
      ...eventsByDate,
      [day.dateKey]: dayEvents,
    };
  }, {});

export const getVisibleEventSummary = (events, limit) => ({
  visibleEvents: events.slice(0, limit),
  hiddenCount: Math.max(events.length - limit, 0),
});
