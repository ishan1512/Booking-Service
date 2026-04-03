export const generateSlots = (startTime, endTime, duration) => {
  const slots = [];

  // Convert "HH:MM" → minutes
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes → "HH:MM"
  const toTimeString = (minutes) => {
    const hrs = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    return `${hrs}:${mins}`;
  };

  let current = toMinutes(startTime);
  const end = toMinutes(endTime);

  while (current + duration <= end) {
    const next = current + duration;

    slots.push({
      start: toTimeString(current),
      end: toTimeString(next),
    });

    current = next;
  }

  return slots;
};
