import {defineStore} from 'pinia';
import {computed, Ref, ref, UnwrapRef} from "vue";
import {STORAGE_KEY_SPEECH, STORAGE_KEY_THEME, ThemeType} from "@/const/const";
import {getStorageItem, getStorageJSON, setStorageItem, setStorageJSON, speak} from "@/utils/util";

export const settingsStore = defineStore('settingsStore', () => {
    /** Что выбрал пользователь: светлая, тёмная или «как в системе». */
    const themeMode: Ref<UnwrapRef<ThemeType>> = ref(ThemeType.System);
    /** Какая тема применена фактически (System уже разрешён в конкретную). */
    const isDarkMode = ref(true);
    const voiceSpeech: Ref<UnwrapRef<SpeechSynthesisVoice | null>> = ref(null);

    /* Ссылку на MediaQueryList нужно удерживать: если создавать его
       на лету, объект может быть собран сборщиком мусора вместе с
       подпиской, и приложение перестанет реагировать на смену
       системной темы. */
    const darkMediaQuery: MediaQueryList | null = window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;

    const resolveIsDark = (mode: ThemeType): boolean => {
        if (mode === ThemeType.Light) return false;
        if (mode === ThemeType.Dark) return true;
        return darkMediaQuery?.matches ?? true;
    };

    const applyTheme = (): void => {
        isDarkMode.value = resolveIsDark(themeMode.value);
        document.documentElement.classList.toggle('ion-palette-dark', isDarkMode.value);
        document.documentElement.classList.toggle('ion-palette-light', !isDarkMode.value);
    };

    const setThemeMode = (mode: ThemeType): void => {
        themeMode.value = mode;
        setStorageItem(STORAGE_KEY_THEME, mode);
        applyTheme();
    };

    /** Оставлено для обратной совместимости: переключает свет/тьму явно. */
    const toggleMode = (): void => {
        setThemeMode(isDarkMode.value ? ThemeType.Light : ThemeType.Dark);
    };

    const setMode = (theme: ThemeType): void => {
        setThemeMode(theme);
    };

    const initSettings = (): void => {
        if (window.speechSynthesis) {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
        }

        const stored = getStorageItem(STORAGE_KEY_THEME);

        /* Раньше здесь хранилось только 'light' | 'dark' — оба значения
           остаются валидными, поэтому выбор существующих пользователей
           сохраняется. Всё остальное трактуем как «как в системе». */
        const isKnownMode = Object.values(ThemeType).includes(stored as ThemeType);
        themeMode.value = isKnownMode ? (stored as ThemeType) : ThemeType.System;
        applyTheme();

        /* В режиме «как в системе» реагируем на смену темы устройства
           на лету, без перезапуска приложения. */
        darkMediaQuery?.addEventListener('change', () => {
            if (themeMode.value === ThemeType.System) applyTheme();
        });

        setVoiceSpeech(getStorageJSON<SpeechSynthesisVoice | null>(STORAGE_KEY_SPEECH, null));
    };

    const setVoiceSpeech = (speech: SpeechSynthesisVoice | null): void => {
        if (speech) voiceSpeech.value = {
            voiceURI: speech.voiceURI,
            name: speech.name,
            lang: speech.lang,
            localService: speech.localService,
            default: speech.default
        };
        setStorageJSON(STORAGE_KEY_SPEECH, voiceSpeech.value);
    }

    const speakText = (text: string): void => {
        speak(text, voiceSpeech.value);
    }

    const isSystemMode = computed((): boolean => themeMode.value === ThemeType.System);

    return {
        themeMode,
        isDarkMode,
        isSystemMode,
        voiceSpeech,
        initSettings,
        toggleMode,
        setMode,
        setThemeMode,
        setVoiceSpeech,
        speakText
    };
});
