"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TriggerAuthContext } from "@trigger.dev/react-hooks";

const queryClient = new QueryClient();

export function Providers({
  children,
  triggerPublicToken,
}: {
  children: React.ReactNode;
  triggerPublicToken: string;
}) {
  return (
    <TriggerAuthContext.Provider value={{ accessToken: triggerPublicToken }}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TriggerAuthContext.Provider>
  );
}
