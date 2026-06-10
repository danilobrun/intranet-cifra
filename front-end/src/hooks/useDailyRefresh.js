import { useEffect } from "react";

const getMillisecondsUntilNextDay = () => {
  const now = new Date();
  const nextDay = new Date(now);
  nextDay.setDate(now.getDate() + 1);
  nextDay.setHours(0, 0, 1, 0);

  return Math.max(nextDay.getTime() - now.getTime(), 1000);
};

export function useDailyRefresh(onRefresh, enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let timeoutId;

    const scheduleNextRefresh = () => {
      timeoutId = window.setTimeout(async () => {
        await Promise.resolve(onRefresh());
        scheduleNextRefresh();
      }, getMillisecondsUntilNextDay());
    };

    scheduleNextRefresh();

    return () => window.clearTimeout(timeoutId);
  }, [enabled, onRefresh]);
}
