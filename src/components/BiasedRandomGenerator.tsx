"use client";

import { useState } from "react";

function sampleTriangular(min: number, max: number, mode: number) {
  const u = Math.random();
  const range = max - min;
  const fMode = (mode - min) / range;
  if (u < fMode) {
    return min + Math.sqrt(u * range * (mode - min));
  }
  return max - Math.sqrt((1 - u) * range * (max - mode));
}

export function BiasedRandomGenerator() {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [target, setTarget] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleGenerate() {
    const minN = Number(min);
    const maxN = Number(max);
    const targetN = Number(target);

    if (min === "" || max === "" || target === "" || !Number.isFinite(minN) || !Number.isFinite(maxN) || !Number.isFinite(targetN)) {
      setError("Enter valid numbers for Min, Max, and Target");
      setResult(null);
      return;
    }
    if (minN >= maxN) {
      setError("Min must be less than Max");
      setResult(null);
      return;
    }
    if (targetN < minN || targetN > maxN) {
      setError("Target must be between Min and Max");
      setResult(null);
      return;
    }

    setError(null);
    setResult(Math.round(sampleTriangular(minN, maxN, targetN)));
  }

  return (
    <div className="card mb-6 p-4">
      <h2 className="mb-1 text-sm font-semibold text-[var(--text-muted)]">Biased Random Number Generator</h2>
      <p className="mb-3 text-xs text-[var(--text-muted)]">
        Picks a random number between Min and Max, weighted so results cluster around Target.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="sm:w-28">
          <label className="label">Min</label>
          <input type="number" value={min} onChange={(e) => setMin(e.target.value)} className="input" />
        </div>
        <div className="sm:w-28">
          <label className="label">Max</label>
          <input type="number" value={max} onChange={(e) => setMax(e.target.value)} className="input" />
        </div>
        <div className="sm:w-28">
          <label className="label">Target (bias)</label>
          <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="input" />
        </div>
        <button type="button" onClick={handleGenerate} className="btn-primary w-full sm:w-auto">
          Generate
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {result !== null && (
        <div className="mt-4 rounded-md border border-[var(--border-gold)] bg-[var(--surface-2)] px-4 py-3 text-center">
          <div className="text-3xl font-bold text-[var(--gold-bright)]">{result}</div>
          <div className="text-xs text-[var(--text-muted)]">generated result</div>
        </div>
      )}
    </div>
  );
}
