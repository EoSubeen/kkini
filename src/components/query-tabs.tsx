"use client";

import { useRouter } from "next/navigation";

/** 같은 화면 안에서 ?tab= 값으로 바꾸는 탭. 재료 탭과 같은 모양(ingredient-tabs)을 쓴다. */
export function QueryTabs({ items, current, label }: { items: { id: string; label: string }[]; current: string; label: string }) {
  const router = useRouter();
  return (
    <div className="ingredient-tabs" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === current}
          data-active={item.id === current}
          onClick={() => router.push(`?tab=${item.id}`, { scroll: false })}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
