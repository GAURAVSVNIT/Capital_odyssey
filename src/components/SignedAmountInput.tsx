"use client";

export function SignedAmountInput({
  value,
  onChange,
  placeholder,
  disabled,
  inputClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  inputClassName?: string;
}) {
  const isNegative = value.trim().startsWith("-");
  const magnitude = value.replace(/^-/, "");

  function setSign(negative: boolean) {
    onChange(negative ? (magnitude ? `-${magnitude}` : "-") : magnitude);
  }

  function handleMagnitudeChange(raw: string) {
    const clean = raw.replace(/^-/, "");
    onChange(isNegative && clean ? `-${clean}` : clean);
  }

  return (
    <div className="flex items-stretch gap-1">
      <button
        type="button"
        onClick={() => setSign(false)}
        disabled={disabled}
        aria-pressed={!isNegative}
        aria-label="Add"
        className={`w-9 shrink-0 rounded-md border text-base font-semibold transition-colors disabled:opacity-50 ${
          !isNegative
            ? "border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--gold-bright)]"
            : "border-[var(--border-gold)] text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
      >
        +
      </button>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={magnitude}
        onChange={(e) => handleMagnitudeChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`input min-w-0 flex-1 ${inputClassName ?? ""}`}
      />
      <button
        type="button"
        onClick={() => setSign(true)}
        disabled={disabled}
        aria-pressed={isNegative}
        aria-label="Subtract"
        className={`w-9 shrink-0 rounded-md border text-base font-semibold transition-colors disabled:opacity-50 ${
          isNegative
            ? "border-red-500 bg-red-500/15 text-red-300"
            : "border-[var(--border-gold)] text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
      >
        −
      </button>
    </div>
  );
}
