interface AvailabilityData {
  [key: string]: {
    from: string;
    to: string;
  };
}

interface AvailabilityDisplayProps {
  availability: AvailabilityData;
}

const dayNames = {
  "1": "Sun",
  "2": "Mon",
  "3": "Tue",
  "4": "Wed",
  "5": "Thu",
  "6": "Fri",
  "7": "Sat",
};

export function AvailabilityDisplay({
  availability,
}: AvailabilityDisplayProps) {
  const sortedDays = Object.keys(availability).sort();

  return (
    <div className="inline-flex flex-wrap gap-1 text-xs">
      {sortedDays.map((day) => (
        <div
          key={day}
          className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md"
        >
          <span className="font-medium text-muted-foreground">
            {dayNames[day as keyof typeof dayNames]}
          </span>
          <span className="text-foreground">
            {availability[day].from}-{availability[day].to}
          </span>
        </div>
      ))}
    </div>
  );
}
