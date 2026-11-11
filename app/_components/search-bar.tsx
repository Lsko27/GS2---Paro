"use client";

import { Loader2, LocateFixed, Search } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { cn } from "@/app/_lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onUseMyLocation: () => void;
  isLocating?: boolean;
  isSearching?: boolean;
  placeholder?: string;
  className?: string;
}

const SearchBar = ({
  value,
  onChange,
  onSearch,
  onUseMyLocation,
  isLocating = false,
  isSearching = false,
  placeholder = "Buscar endereço, bairro ou local",
  className,
}: SearchBarProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSearching) return;

    onSearch();
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        "relative z-10 mx-3 -mt-3 flex h-12 items-center rounded-full border bg-white px-1 shadow-sm focus-within:ring-2 focus-within:ring-primary/30",
        className,
      )}
    >
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label="Buscar pontos de apoio"
        disabled={isSearching}
        className="size-8 shrink-0 rounded-full text-slate-700"
      >
        {isSearching ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Search className="size-4" aria-hidden="true" />
        )}
      </Button>

      <Input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0 md:text-xs"
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Usar minha localização"
        disabled={isLocating}
        onClick={onUseMyLocation}
        className="size-8 shrink-0 rounded-full text-slate-700"
      >
        {isLocating ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <LocateFixed className="size-4" aria-hidden="true" />
        )}
      </Button>
    </form>
  );
};

export default SearchBar;
