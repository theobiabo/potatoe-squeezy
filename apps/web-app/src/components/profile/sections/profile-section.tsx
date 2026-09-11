import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProfileSectionProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function ProfileSection({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: ProfileSectionProps) {
  return (
    <Card
      className={cn(
        "gap-3 border-line bg-surface-raised shadow-none",
        className,
      )}
    >

      {(title || description || action) && (
        <CardHeader className="flex-row items-start justify-between gap-4 px-4 pt-4">
          <div className="min-w-0">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent
        className={cn(
          "px-4 pb-4",
          !title && !description && "pt-4",
          contentClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
