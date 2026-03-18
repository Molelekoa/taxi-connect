import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: { value: string; label: string }[];
  placeholder?: string;
  id?: string;
  className?: string;
  error?: boolean;
}

const MIN_DROPDOWN_HEIGHT = 120;
const MAX_DROPDOWN_HEIGHT = 320;

const LocationInput = ({
  value,
  onChange,
  suggestions,
  placeholder = "Type a city or address",
  id,
  className,
  error,
}: LocationInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState<"up" | "down">("down");
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(240);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  const filtered = value.length > 0
    ? suggestions.filter((s) =>
        s.label.toLowerCase().includes(value.toLowerCase()) ||
        s.value.toLowerCase().includes(value.toLowerCase())
      )
    : suggestions;

  const showDropdown = isOpen && inputFocused && filtered.length > 0;
  const hasOverflow = filtered.length > 4;

  useEffect(() => {
    if (!showDropdown) return;

    const updateDropdownLayout = () => {
      const input = wrapperRef.current?.querySelector("input");
      if (!input) return;

      const rect = input.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const viewportOffsetTop = window.visualViewport?.offsetTop ?? 0;
      const spaceAbove = rect.top - viewportOffsetTop;
      const spaceBelow = viewportHeight - rect.bottom;
      const shouldOpenUp = spaceBelow < 220 && spaceAbove > spaceBelow;
      const availableSpace = shouldOpenUp ? spaceAbove - 12 : spaceBelow - 12;

      setDropdownDirection(shouldOpenUp ? "up" : "down");
      setDropdownMaxHeight(
        Math.max(MIN_DROPDOWN_HEIGHT, Math.min(MAX_DROPDOWN_HEIGHT, availableSpace)),
      );
    };

    updateDropdownLayout();

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", updateDropdownLayout);
    viewport?.addEventListener("scroll", updateDropdownLayout);
    window.addEventListener("resize", updateDropdownLayout);
    window.addEventListener("scroll", updateDropdownLayout, true);

    return () => {
      viewport?.removeEventListener("resize", updateDropdownLayout);
      viewport?.removeEventListener("scroll", updateDropdownLayout);
      window.removeEventListener("resize", updateDropdownLayout);
      window.removeEventListener("scroll", updateDropdownLayout, true);
    };
  }, [showDropdown, filtered.length]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative" role="combobox" aria-expanded={showDropdown} aria-haspopup="listbox">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setInputFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setInputFocused(false), 150);
          }}
          placeholder={placeholder}
          className={cn("pl-9", error && "border-destructive", className)}
          autoComplete="off"
          aria-label={placeholder}
          aria-autocomplete="list"
        />
      </div>

      {showDropdown && (
        <div
          className={cn(
            "absolute z-50 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden",
            dropdownDirection === "up" ? "bottom-full mb-1" : "top-full mt-1",
          )}
          role="listbox"
        >
          <div
            className="overflow-y-auto overscroll-contain mobile-scrollbar"
            style={{
              maxHeight: `${dropdownMaxHeight}px`,
              WebkitOverflowScrolling: "touch",
            }}
          >
            {filtered.map((suggestion) => (
              <button
                key={suggestion.value}
                type="button"
                className="w-full text-left px-3 py-3 text-sm hover:bg-accent hover:text-accent-foreground transition-colors active:bg-accent/80 touch-manipulation"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(suggestion.value);
                  setIsOpen(false);
                }}
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  {suggestion.label}
                </span>
              </button>
            ))}
            {hasOverflow && <div className="h-2" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationInput;
