"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { FC, useState } from "react";

const Providers: FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default Providers;
