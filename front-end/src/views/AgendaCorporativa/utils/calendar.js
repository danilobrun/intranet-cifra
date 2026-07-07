export const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getMonthStart = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const addMonths = (date, amount) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

export const getStartOfWeek = (date) => {
  const weekStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  weekStart.setDate(date.getDate() - date.getDay());

  return weekStart;
};

export const getEndOfWeek = (date) => {
  const weekEnd = getStartOfWeek(date);

  weekEnd.setDate(weekEnd.getDate() + 6);

  return weekEnd;
};

export const addWeeks = (date, amount) => {
  const nextDate = new Date(date);

  nextDate.setDate(nextDate.getDate() + amount * 7);

  return nextDate;
};

export const formatMonthTitle = (date) =>
  new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  })
    .format(date)
    .replace(/^\w/, (letter) => letter.toLocaleUpperCase("pt-BR"));

const formatDayNumber = (date) => String(date.getDate()).padStart(2, "0");

const formatMonthName = (date) =>
  new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);

export const formatWeekTitle = (startDate, endDate) => {
  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();
  const sameYear = startDate.getFullYear() === endDate.getFullYear();

  if (sameMonth) {
    return `${formatDayNumber(startDate)} a ${formatDayNumber(
      endDate,
    )} de ${formatMonthName(startDate)} de ${startDate.getFullYear()}`;
  }

  if (sameYear) {
    return `${formatDayNumber(startDate)} de ${formatMonthName(
      startDate,
    )} a ${formatDayNumber(endDate)} de ${formatMonthName(
      endDate,
    )} de ${endDate.getFullYear()}`;
  }

  return `${formatDayNumber(startDate)} de ${formatMonthName(
    startDate,
  )} de ${startDate.getFullYear()} a ${formatDayNumber(
    endDate,
  )} de ${formatMonthName(endDate)} de ${endDate.getFullYear()}`;
};

export const isSameDate = (firstDate, secondDate) =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate();

export const buildMonthCalendarDays = (referenceDate, today = new Date()) => {
  const monthStart = getMonthStart(referenceDate);
  const monthEnd = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0,
  );
  const calendarStart = new Date(monthStart);
  const calendarEnd = new Date(monthEnd);

  calendarStart.setDate(monthStart.getDate() - monthStart.getDay());
  calendarEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));

  const days = [];
  const cursor = new Date(calendarStart);

  while (cursor <= calendarEnd) {
    const date = new Date(cursor);

    days.push({
      key: toDateKey(date),
      date,
      dateKey: toDateKey(date),
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === monthStart.getMonth(),
      isToday: isSameDate(date, today),
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

export const buildWeekCalendarDays = (referenceDate, today = new Date()) => {
  const weekStart = getStartOfWeek(referenceDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    return {
      key: toDateKey(date),
      date,
      dateKey: toDateKey(date),
      dayNumber: date.getDate(),
      isCurrentMonth: true,
      isToday: isSameDate(date, today),
    };
  });
};

export const getCalendarVisibleRange = (calendarDays = []) => {
  if (!calendarDays.length) {
    return {
      start: "",
      end: "",
    };
  }

  return {
    start: calendarDays[0].dateKey,
    end: calendarDays[calendarDays.length - 1].dateKey,
  };
};
