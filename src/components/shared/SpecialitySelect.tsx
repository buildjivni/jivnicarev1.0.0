"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { SPECIALITIES } from "@/lib/data/specialities";

interface SpecialitySelectProps {
  selected?: string;
  onChange: (speciality: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SpecialitySelect({
  selected = "",
  onChange,
  placeholder = "Search your speciality...",
  className = "",
}: SpecialitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter specialities
  const filtered = SPECIALITIES.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const popular = filtered.filter((s) => s.tier === 1);
  const specialists = filtered.filter((s) => s.tier !== 1);

  // Flattened list for keyboard navigation index matching
  const flatList = [...popular, ...specialists];

  const handleSelect = (name: string) => {
    onChange(name);
    setSearch("");
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => (prev + 1) % flatList.length);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => (prev - 1 + flatList.length) % flatList.length);
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < flatList.length) {
        handleSelect(flatList[activeIndex].name);
      } else if (flatList.length > 0) {
        handleSelect(flatList[0].name);
      }
      e.preventDefault();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
      e.preventDefault();
    }
  };

  const selectedItem = SPECIALITIES.find((s) => s.name === selected);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setTimeout(() => inputRef.current?.focus(), 50);
        }}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between gap-2 bg-surface-card border border-border px-4 py-2.5 rounded-md text-left text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
      >
        <span className={selected ? "text-content-primary" : "text-content-muted"}>
          {selectedItem ? (
            <span className="flex items-center gap-2">
              <span className="text-base">{selectedItem.icon}</span>
              <span>{selectedItem.name}</span>
            </span>
          ) : (
            placeholder
          )}
        </span>
        {selected ? (
          <X
            className="w-4 h-4 text-content-muted hover:text-status-error cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          />
        ) : (
          <ChevronDown className="w-4 h-4 text-content-muted" />
        )}
      </button>

      {/* Dropdown Container */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-full bg-surface-card border border-border rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col animate-in fade-in duration-100">
          
          {/* Search Box */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2 bg-surface-primary">
            <Search className="w-4 h-4 text-content-muted" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type to filter..."
              className="w-full bg-transparent text-sm focus:outline-none placeholder-content-muted text-content-primary"
            />
          </div>

          {/* List Scroll Area */}
          <div className="overflow-y-auto flex-1 max-h-60 py-1">
            
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-content-muted text-center">
                No specialities found
              </div>
            ) : (
              <>
                {/* Popular Group */}
                {popular.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-semibold text-content-muted uppercase tracking-wider bg-surface-secondary/50">
                      Popular Specialities
                    </div>
                    {popular.map((item) => {
                      const listIndex = flatList.findIndex((f) => f.name === item.name);
                      const isSelected = selected === item.name;
                      const isActive = activeIndex === listIndex;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item.name)}
                          className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                            isActive ? "bg-surface-secondary text-brand-blue" : ""
                          } ${isSelected ? "bg-brand-blue/5 text-brand-blue font-medium" : "text-content-primary hover:bg-surface-primary"}`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="text-base">{item.icon}</span>
                            <span>{item.name}</span>
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-brand-blue" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Specialists Group */}
                {specialists.length > 0 && (
                  <div className="mt-1">
                    <div className="px-3 py-1.5 text-xs font-semibold text-content-muted uppercase tracking-wider bg-surface-secondary/50">
                      Specialists
                    </div>
                    {specialists.map((item) => {
                      const listIndex = flatList.findIndex((f) => f.name === item.name);
                      const isSelected = selected === item.name;
                      const isActive = activeIndex === listIndex;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item.name)}
                          className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                            isActive ? "bg-surface-secondary text-brand-blue" : ""
                          } ${isSelected ? "bg-brand-blue/5 text-brand-blue font-medium" : "text-content-primary hover:bg-surface-primary"}`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="text-base">{item.icon}</span>
                            <span>{item.name}</span>
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-brand-blue" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}

          </div>

        </div>
      )}
      
    </div>
  );
}
