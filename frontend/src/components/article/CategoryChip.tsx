import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import type { Category } from "@/lib/types";

interface Props {
  category: Category;
  asLink?: boolean;
}

export function CategoryChip({ category, asLink = true }: Props) {
  const badge = <Badge color={category.color}>{category.name}</Badge>;
  if (!asLink) return badge;
  return (
    <Link to={`/category/${category.slug}`} className="hover:opacity-80">
      {badge}
    </Link>
  );
}
