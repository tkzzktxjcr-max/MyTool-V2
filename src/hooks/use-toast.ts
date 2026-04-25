import * as React from "react";

export type Toast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
};

export function useToast() {
  return { toasts: [] as Toast[] };
}
