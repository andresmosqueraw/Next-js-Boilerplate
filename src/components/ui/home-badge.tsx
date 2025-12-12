import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function HomeBadge() {
  return (
    <Badge
      variant="secondary"
      className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
    >
      <Sparkles className="mr-1 h-3 w-3" />
      New UI Library
    </Badge>
  );
}
