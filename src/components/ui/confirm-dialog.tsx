"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "./button";

/** App-styled confirmation with native focus containment and Escape support. */
export function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, onConfirm, onCancel }: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>("button")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <dialog
      aria-describedby={`${id}-description`}
      aria-labelledby={`${id}-title`}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto overscroll-contain rounded-[4px] border border-paper-line bg-paper p-0 text-ink shadow-xl backdrop:bg-ink/65"
      onCancel={(event) => { event.preventDefault(); onCancel(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onCancel(); }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("button");
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      ref={dialogRef}
    >
      <div className="grid gap-5 p-6 sm:p-8">
        <h2 className="font-display text-3xl font-semibold leading-tight text-indigo-deep" id={`${id}-title`}>{title}</h2>
        <p className="text-sm leading-6 text-ink-mute" id={`${id}-description`}>{description}</p>
        <div className="grid gap-2 border-t border-paper-line pt-5 sm:grid-cols-2">
          <Button onClick={onCancel} variant="secondary">{cancelLabel}</Button>
          <Button onClick={onConfirm} variant="danger">{confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  );
}
