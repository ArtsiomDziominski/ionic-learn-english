import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { applyStatusBarTheme } from '@/utils/statusBar';
import { getStorageItem, getStorageJSON, setStorageJSON } from '@/utils/util';
import { trackEvent } from '@/utils/analytics';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface AppSettings {
  theme: ThemeMode;
  sound: boolean;
  haptics: boolean;
  /** Жизни как в Duolingo; можно отключить и учиться без ограничений. */
  hearts: boolean;
  /** Задания на слух. */
  listening: boolean;
  voiceURI: string | null;
  speechRate: number;
}

const STORAGE_KEY = 'slovaday.settings.v1';

const defaults = (): AppSettings => ({
  theme: 'system',
  sound: true,
  haptics: true,
  hearts: true,
  listening: true,
  voiceURI: null,
  speechRate: 0.9,
});

/** Настройки прежней версии лежали в ключах 'theme' и 'speech'. */
function readLegacy(): Partial<AppSettings> {
  const out: Partial<AppSettings> = {};
  const theme = getStorageItem('theme');
  if (theme === 'light' || theme === 'dark' || theme === 'system') out.theme = theme;
  const speech = getStorageJSON<{ voiceURI?: unknown } | null>('speech', null);
  if (speech && typeof speech.voiceURI === 'string') out.voiceURI = speech.voiceURI;
  return out;
}

function load(): AppSettings {
  const stored = getStorageJSON<Partial<AppSettings> | null>(STORAGE_KEY, null);
  const raw = stored ?? readLegacy();
  const base = defaults();
  return {
    theme: raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : 'system',
    sound: typeof raw.sound === 'boolean' ? raw.sound : base.sound,
    haptics: typeof raw.haptics === 'boolean' ? raw.haptics : base.haptics,
    hearts: typeof raw.hearts === 'boolean' ? raw.hearts : base.hearts,
    listening: typeof raw.listening === 'boolean' ? raw.listening : base.listening,
    voiceURI: typeof raw.voiceURI === 'string' ? raw.voiceURI : null,
    speechRate: typeof raw.speechRate === 'number' && raw.speechRate >= 0.5 && raw.speechRate <= 1.5 ? raw.speechRate : base.speechRate,
  };
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>(load());

  /* Ссылку на MediaQueryList нужно удерживать: созданный на лету
     объект может собрать сборщик мусора вместе с подпиской, и смена
     системной темы перестанет отслеживаться. */
  const darkQuery: MediaQueryList | null = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;
  const systemDark = ref(darkQuery?.matches ?? false);
  darkQuery?.addEventListener('change', (e) => {
    systemDark.value = e.matches;
  });

  const isDark = computed(() => settings.value.theme === 'dark' || (settings.value.theme === 'system' && systemDark.value));

  const applyTheme = (): void => {
    const root = document.documentElement;
    root.classList.toggle('ion-palette-dark', isDark.value);
    root.classList.toggle('ion-palette-light', !isDark.value);
    root.dataset.theme = isDark.value ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark.value ? '#131022' : '#FFFFFF');
    applyStatusBarTheme(isDark.value);
  };

  watch(isDark, applyTheme);
  watch(settings, (value) => setStorageJSON(STORAGE_KEY, value), { deep: true });

  const init = (): void => {
    applyTheme();
    setStorageJSON(STORAGE_KEY, settings.value);
  };

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]): void => {
    const changed = settings.value[key] !== value;
    settings.value = { ...settings.value, [key]: value };
    if (!changed) return;
    // Название голоса не отправляем: оно длинное и ничего не говорит о поведении
    trackEvent('setting_change', { setting: key, setting_value: key === 'voiceURI' ? (value ? 'custom' : 'auto') : String(value) });
  };

  return { settings, isDark, init, update };
});
