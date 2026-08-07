"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useEventEnded() {
  const { data } = useSWR<{ endedAt: string | null }>("/api/event", fetcher, {
    refreshInterval: 5000,
  });
  return data?.endedAt != null;
}
