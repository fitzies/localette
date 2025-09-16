import { TriangleAlert } from "lucide-react";

export default function Alert({
  text,
  color,
  className,
}: {
  text: string;
  color: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-${color}-500/50 px-4 py-3 text-${color}-600 ${className}`}
    >
      <p className="text-sm">
        <TriangleAlert
          className="me-3 -mt-0.5 inline-flex opacity-60"
          size={16}
          aria-hidden="true"
        />
        {text}
      </p>
    </div>
  );
}
