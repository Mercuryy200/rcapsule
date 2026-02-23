// hooks/useAnalytics.ts
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAnalytics() {
  const { data, error, mutate } = useSWR("/api/analytics", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
  });

  return {
    analytics: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}
