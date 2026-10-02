import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastTone = 'info' | 'success' | 'error' | 'reward';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  icon?: string;
}

/** Короткие всплывающие сообщения поверх любого экрана. */
export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);
  let counter = 0;

  const dismiss = (id: number): void => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const show = (message: string, tone: ToastTone = 'info', icon?: string, ms = 3200): void => {
    const id = ++counter;
    toasts.value = [...toasts.value.slice(-2), { id, message, tone, icon }];
    window.setTimeout(() => dismiss(id), ms);
  };

  return { toasts, show, dismiss };
});
