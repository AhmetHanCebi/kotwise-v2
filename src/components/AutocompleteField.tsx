'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface AutocompleteFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | string[];
  icon?: React.ReactNode;
  error?: string;
  allowCustom?: boolean;
}

export default function AutocompleteField({
  label,
  placeholder,
  value,
  onChange,
  options,
  icon,
  error,
  allowCustom = false,
}: AutocompleteFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useRef(`autocomplete-list-${label.replace(/\s+/g, '-').toLowerCase()}`).current;

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes((search || value).toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (opt: string) => {
    onChange(opt);
    setOpen(false);
    setSearch('');
  };

  const handleInputChange = (val: string) => {
    setSearch(val);
    if (allowCustom) onChange(val);
    if (!open) setOpen(true);
  };

  const handleClear = () => {
    onChange('');
    setSearch('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <label
        className="block text-xs font-semibold mb-1.5 px-1"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {icon}
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={listId}
          value={open ? search || value : value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { setOpen(true); setSearch(''); }}
          placeholder={placeholder ?? label}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none pr-16"
          style={{
            background: 'var(--color-bg-card, var(--color-bg))',
            border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
            color: 'var(--color-text-primary)',
            paddingLeft: icon ? 36 : 14,
          }}
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-black/5"
              type="button"
              aria-label="Temizle"
            >
              <X size={14} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          )}
          <ChevronDown
            size={14}
            style={{
              color: 'var(--color-text-muted)',
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </div>
      </div>
      {error && (
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-error)' }}>{error}</p>
      )}

      {open && filtered.length > 0 && (
        <div
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-xl py-1"
          style={{
            background: 'var(--color-bg-card, white)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg, 0 4px 16px rgba(0,0,0,0.12))',
          }}
        >
          {filtered.map((opt) => (
            <button
              key={opt}
              role="option"
              aria-selected={opt === value}
              onClick={() => handleSelect(opt)}
              className="w-full text-left px-3.5 py-2 text-sm hover:bg-black/5 transition-colors"
              style={{
                color: opt === value ? 'var(--color-primary)' : 'var(--color-text-primary)',
                fontWeight: opt === value ? 600 : 400,
              }}
              type="button"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
