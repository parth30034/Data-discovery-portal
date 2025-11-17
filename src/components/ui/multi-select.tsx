"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react@0.487.0";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { cn } from "./utils";

export interface MultiSelectOption {
  id: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
  id,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (optionId: string) => {
    const newSelected = selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId];
    onChange(newSelected);
  };

  const selectedLabels = options
    .filter((opt) => selected.includes(opt.id))
    .map((opt) => opt.label);

  const displayText =
    selected.length === 0
      ? placeholder
      : selected.length === 1
      ? selectedLabels[0]
      : `${selected.length} items selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal",
            !selected.length && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="max-h-[300px] overflow-y-auto p-1">
          {options.map((option) => (
            <div
              key={option.id}
              className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
              onClick={() => handleToggle(option.id)}
            >
              <Checkbox
                id={`${id}-${option.id}`}
                checked={selected.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
              />
              <Label
                htmlFor={`${id}-${option.id}`}
                className="flex-1 cursor-pointer text-sm font-normal"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full text-xs"
              onClick={() => {
                onChange([]);
              }}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

