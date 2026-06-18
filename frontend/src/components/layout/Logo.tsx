import { Link } from "react-router-dom";

export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary font-serif text-lg font-bold text-primary-foreground">
        W
      </span>
      {withText && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Wiki<span className="text-primary">verse</span>
        </span>
      )}
    </Link>
  );
}
