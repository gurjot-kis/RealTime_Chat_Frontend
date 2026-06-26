"use client";

import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "@/store/store";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      {children} <Toaster position="top-right" richColors closeButton />
    </Provider>
  );
}
