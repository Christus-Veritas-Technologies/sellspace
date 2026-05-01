"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchSession,
  getOptimisticSessionState,
  SESSION_QUERY_KEY,
} from "@/lib/session-client";

export function useSession() {
  const query = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchSession,
    initialData: getOptimisticSessionState,
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    isAuthenticated: query.data.isAuthenticated,
    user: query.data.user,
    isLoading: query.isFetching,
  };
}
