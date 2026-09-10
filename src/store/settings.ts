import {defineStore} from 'pinia';
import {computed, Ref, ref, UnwrapRef} from "vue";
import {STORAGE_KEY_SPEECH, STORAGE_KEY_THEME, ThemeType} from "@/const/const";
import {speak} from "@/utils/util";

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
        try {
            localStorage.setItem(STORAGE_KEY_THEME, mode);
        } catch (error) {
            console.warn('Не удалось сохранить тему', error);
        }
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

        let stored: string | null = null;
        try {
            stored = localStorage.getItem(STORAGE_KEY_THEME);
        } catch (error) {
            console.warn('Не удалось прочитать тему', error);
        }

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

        let speech: SpeechSynthesisVoice | null = null;
        try {
            const raw = localStorage.getItem(STORAGE_KEY_SPEECH);
            speech = raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.warn('Не удалось прочитать голос озвучки', error);
        }
        setVoiceSpeech(speech);
    };

    const setVoiceSpeech = (speech: SpeechSynthesisVoice | null): void => {
        if (speech) voiceSpeech.value = {
            voiceURI: speech.voiceURI,
            name: speech.name,
            lang: speech.lang,
            localService: speech.localService,
            default: speech.default
        };
        try {
            localStorage.setItem(STORAGE_KEY_SPEECH, JSON.stringify(voiceSpeech.value));
        } catch (error) {
            console.warn('Не удалось сохранить голос озвучки', error);
        }
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
