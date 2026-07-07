import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import {
  canDeleteAgendaEvent,
  canEditAgendaEvent,
} from "../../helpers/agendaCorporativaPermissions";
import {
  atualizarEvento,
  criarAgendaCorporativaEvento,
  excluirEvento,
  listarEventos,
} from "../../services/AgendaCorporativa.service";
import { selectUser } from "../../store/User/User.selectors";
import { CalendarToolbar } from "./components/CalendarToolbar";
import { EventDeleteConfirmModal } from "./components/EventDeleteConfirmModal";
import { EventDetailsDrawer } from "./components/EventDetailsDrawer";
import { EventDrawer } from "./components/EventDrawer";
import { MonthCalendar } from "./components/MonthCalendar";
import { WeekCalendar } from "./components/WeekCalendar";
import {
  addMonths,
  addWeeks,
  buildMonthCalendarDays,
  buildWeekCalendarDays,
  formatMonthTitle,
  formatWeekTitle,
  getCalendarVisibleRange,
} from "./utils/calendar";
import {
  groupEventsByCalendarDay,
  mapApiEventsToCalendarEvents,
} from "./utils/events";

export function AgendaCorporativaView() {
  const user = useSelector(selectUser);
  const today = useMemo(() => new Date(), []);
  const [currentPeriodDate, setCurrentPeriodDate] = useState(today);
  const [selectedView, setSelectedView] = useState("Mês");
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false);
  const [eventDrawerDate, setEventDrawerDate] = useState(today);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [agendaEvents, setAgendaEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [eventsReloadKey, setEventsReloadKey] = useState(0);

  const isWeekView = selectedView === "Semana";
  const monthCalendarDays = useMemo(
    () => buildMonthCalendarDays(currentPeriodDate, today),
    [currentPeriodDate, today],
  );
  const weekCalendarDays = useMemo(
    () => buildWeekCalendarDays(currentPeriodDate, today),
    [currentPeriodDate, today],
  );
  const visibleCalendarDays = isWeekView ? weekCalendarDays : monthCalendarDays;
  const visibleRange = useMemo(
    () => getCalendarVisibleRange(visibleCalendarDays),
    [visibleCalendarDays],
  );
  const periodTitle = useMemo(() => {
    if (isWeekView && weekCalendarDays.length) {
      return formatWeekTitle(
        weekCalendarDays[0].date,
        weekCalendarDays[weekCalendarDays.length - 1].date,
      );
    }

    return formatMonthTitle(currentPeriodDate);
  }, [currentPeriodDate, isWeekView, weekCalendarDays]);
  const eventsByDate = useMemo(
    () => groupEventsByCalendarDay(agendaEvents, visibleCalendarDays),
    [agendaEvents, visibleCalendarDays],
  );
  const canEditSelectedEvent = useMemo(
    () => canEditAgendaEvent(user, selectedEvent),
    [selectedEvent, user],
  );
  const canDeleteSelectedEvent = useMemo(
    () => canDeleteAgendaEvent(user, selectedEvent),
    [selectedEvent, user],
  );

  useEffect(() => {
    if (!visibleRange.start || !visibleRange.end) {
      return undefined;
    }

    const abortController = new AbortController();

    const loadEvents = async () => {
      setIsLoadingEvents(true);
      setEventsError("");

      try {
        const response = await listarEventos(
          {
            start: visibleRange.start,
            end: visibleRange.end,
          },
          {
            signal: abortController.signal,
          },
        );
        const apiEvents = Array.isArray(response)
          ? response
          : response?.eventos || [];

        setAgendaEvents(mapApiEventsToCalendarEvents(apiEvents));
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setAgendaEvents([]);
        setEventsError("Erro ao carregar os eventos. Tente novamente mais tarde!");
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingEvents(false);
        }
      }
    };

    loadEvents();

    return () => abortController.abort();
  }, [eventsReloadKey, visibleRange.end, visibleRange.start]);

  const handlePreviousMonth = () => {
    setCurrentPeriodDate((date) =>
      isWeekView ? addWeeks(date, -1) : addMonths(date, -1),
    );
  };

  const handleNextMonth = () => {
    setCurrentPeriodDate((date) =>
      isWeekView ? addWeeks(date, 1) : addMonths(date, 1),
    );
  };

  const handleGoToToday = () => {
    setCurrentPeriodDate(today);
  };

  const handleOpenEventDrawer = (date = today) => {
    setEventDrawerDate(new Date(date));
    setIsEventDrawerOpen(true);
  };

  const handleCreateEvent = () => {
    handleOpenEventDrawer(today);
  };

  const handleDayClick = (day) => {
    handleOpenEventDrawer(day.date);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseEventDrawer = () => {
    setIsEventDrawerOpen(false);
  };

  const handleCloseDetailsDrawer = () => {
    setSelectedEvent(null);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setSelectedEvent(null);
  };

  const handleCloseEditDrawer = () => {
    setEditingEvent(null);
  };

  const handleAskDeleteEvent = (event) => {
    setEventToDelete(event);
  };

  const handleCancelDeleteEvent = () => {
    if (!isDeletingEvent) {
      setEventToDelete(null);
    }
  };

  const handleSubmitEvent = async (payload) => {
    setIsCreatingEvent(true);

    try {
      await criarAgendaCorporativaEvento(payload);
      toast.success("Evento criado com sucesso.");
      setIsEventDrawerOpen(false);
      setEventsReloadKey((currentKey) => currentKey + 1);
      return true;
    } catch (error) {
      toast.error(error.message || "Falha ao criar evento.");
      return false;
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleSubmitEventUpdate = async (payload) => {
    if (!editingEvent?.id) {
      toast.error("Evento inválido para edição.");
      return false;
    }

    setIsUpdatingEvent(true);

    try {
      await atualizarEvento(editingEvent.id, payload);
      toast.success("Evento atualizado com sucesso.");
      setEditingEvent(null);
      setEventsReloadKey((currentKey) => currentKey + 1);
      return true;
    } catch (error) {
      toast.error(error.message || "Falha ao atualizar evento.");
      return false;
    } finally {
      setIsUpdatingEvent(false);
    }
  };

  const handleConfirmDeleteEvent = async () => {
    if (!eventToDelete?.id) {
      toast.error("Evento inválido para exclusão.");
      return;
    }

    setIsDeletingEvent(true);

    try {
      await excluirEvento(eventToDelete.id);
      toast.success("Evento excluído com sucesso.");
      setEventToDelete(null);
      setSelectedEvent(null);
      setEventsReloadKey((currentKey) => currentKey + 1);
    } catch (error) {
      toast.error(error.message || "Falha ao excluir evento.");
    } finally {
      setIsDeletingEvent(false);
    }
  };

  return (
    <LayoutPortal>
      <PageSection>
        <PortalHeader
          title="Calendário"
          description="Acompanhe eventos, compromissos e programações internas da empresa."
        />

        <CalendarToolbar
          periodTitle={periodTitle}
          selectedView={selectedView}
          onViewChange={setSelectedView}
          onGoToToday={handleGoToToday}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onCreateEvent={handleCreateEvent}
        />

        {isWeekView ? (
          <WeekCalendar
            weekDays={weekCalendarDays}
            eventsByDate={eventsByDate}
            eventsError={eventsError}
            isLoadingEvents={isLoadingEvents}
            periodTitle={periodTitle}
            visibleEventCount={agendaEvents.length}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        ) : (
          <MonthCalendar
            calendarDays={monthCalendarDays}
            eventsByDate={eventsByDate}
            eventsError={eventsError}
            isLoadingEvents={isLoadingEvents}
            periodTitle={periodTitle}
            visibleEventCount={agendaEvents.length}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        )}

        <EventDrawer
          show={isEventDrawerOpen}
          initialDate={eventDrawerDate}
          isSubmitting={isCreatingEvent}
          onHide={handleCloseEventDrawer}
          onSubmit={handleSubmitEvent}
        />

        <EventDetailsDrawer
          show={Boolean(selectedEvent)}
          canDelete={canDeleteSelectedEvent}
          canEdit={canEditSelectedEvent}
          event={selectedEvent}
          onDelete={handleAskDeleteEvent}
          onEdit={handleEditEvent}
          onHide={handleCloseDetailsDrawer}
        />

        <EventDrawer
          show={Boolean(editingEvent)}
          mode="edit"
          initialEvent={editingEvent}
          isSubmitting={isUpdatingEvent}
          onHide={handleCloseEditDrawer}
          onSubmit={handleSubmitEventUpdate}
        />

        <EventDeleteConfirmModal
          show={Boolean(eventToDelete)}
          event={eventToDelete}
          isSubmitting={isDeletingEvent}
          onCancel={handleCancelDeleteEvent}
          onConfirm={handleConfirmDeleteEvent}
        />
      </PageSection>
    </LayoutPortal>
  );
}

const PageSection = styled.section`
  width: 100%;
  min-height: calc(100vh - 72px);
  padding: 0 0 2rem 0;
`;
