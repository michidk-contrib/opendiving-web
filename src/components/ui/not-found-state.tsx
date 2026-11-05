import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export interface NotFoundStateProps {
  message: string;
  backHref: string;
  backLabel: string;
}

// Centered "not found" message + back button, used by detail/edit pages when
// the resource being viewed/edited couldn't be loaded.
export function NotFoundState({
  message,
  backHref,
  backLabel,
}: NotFoundStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-muted-foreground mb-4">{message}</div>
      <ButtonLink href={backHref}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        {backLabel}
      </ButtonLink>
    </div>
  );
}
