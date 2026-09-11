import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface GithubUserSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export function GithubUserSearch({
  searchQuery,
  onSearchChange,
  onSearch,
  loading,
}: GithubUserSearchProps) {
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSearch();
    }
  };

  return (
    <Card className="gap-0 bg-surface-raised">
      <CardContent className="p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search GitHub username..."
              aria-label="Search GitHub username"
              className="h-10 border-line bg-surface-inset px-3 text-content-primary placeholder:text-content-tertiary focus-visible:border-action-primary focus-visible:ring-focus"
            />
          </div>
          <Button
            variant="default"
            onClick={onSearch}
            disabled={loading}
            className="shrink-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span
                  className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden="true"
                />
                Searching...
              </span>
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
