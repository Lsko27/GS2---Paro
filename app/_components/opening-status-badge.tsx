import { Badge } from "@/app/_components/ui/badge";

type OpeningStatusBadgeProps = {
  isOpen: boolean | null;
  className?: string;
};

const OpeningStatusBadge = ({
  isOpen,
  className = "",
}: OpeningStatusBadgeProps) => {
  if (isOpen === null) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className={`gap-1.5 rounded-full border-0 p-3 text-sm font-medium ${
        isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      } ${className}`}
    >
      <span
        className={`size-1.5 rounded-full ${
          isOpen ? "bg-green-500" : "bg-red-500"
        }`}
        aria-hidden="true"
      />

      {isOpen ? "Aberto agora" : "Fechado agora"}
    </Badge>
  );
};

export default OpeningStatusBadge;
