/**
 * Dashboard hook
 * Fetches and manages dashboard data for authenticated company
 */

import { useState, useEffect, useCallback } from "react";
import { getDashboard } from "../lib/api.js";
import type { DashboardData } from "../types/dashboard-types.js";

interface UseDashboardReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage dashboard data
 */
export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getDashboard();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error.message || "Failed to load dashboard data");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load dashboard data. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}


