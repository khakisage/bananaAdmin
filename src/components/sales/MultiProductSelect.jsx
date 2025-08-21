"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

export default function MultiProductSelect({
  products, // [{id, title}]
  value, // number[] (선택된 상품ID들)
  onChange,
  placeholder = "상품 선택",
}) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => products.filter((p) => value.includes(p.id)),
    [products, value]
  );

  const toggle = (id) => {
    const next = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];
    onChange(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[220px] justify-between">
            {selected.length > 0 ? `${selected.length}개 선택됨` : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0">
          <Command>
            <CommandInput placeholder="상품 검색..." />
            <CommandEmpty>결과 없음</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {products.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.title}
                  onSelect={() => toggle(p.id)}
                >
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                    <Checkbox checked={value.includes(p.id)} />
                  </div>
                  <span className="truncate">{p.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* 선택 배지 요약 */}
      {selected.map((p) => (
        <Badge
          key={p.id}
          variant="secondary"
          className="cursor-pointer"
          onClick={() => toggle(p.id)}
        >
          {p.title}
        </Badge>
      ))}
    </div>
  );
}
