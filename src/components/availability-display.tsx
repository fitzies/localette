import { Badge } from "./ui/badge";

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
        <Badge key={day} variant={"outline"}>
          <span className="font-medium">
            {dayNames[day as keyof typeof dayNames]}
          </span>
          <span>
            {availability[day].from}-{availability[day].to}
          </span>
        </Badge>
      ))}
    </div>
  );
}
