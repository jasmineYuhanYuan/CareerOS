"use client";

import type { ReactNode } from "react";
import { Dialog } from "./dialog";

export function MobileBottomSheet({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return <Dialog open={open} title={title} onClose={onClose}>{children}</Dialog>;
}
