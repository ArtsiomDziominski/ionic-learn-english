import {defineStore} from 'pinia';
import {Ref, ref, UnwrapRef} from "vue";
import {STORAGE_KEY_SPEECH, STORAGE_KEY_THEME, ThemeType} from "@/const/const";
import {getStorageItem, getStorageJSON, setStorageItem, setStorageJSON, speak} from "@/utils/util";

export const settingsStore = defineStore('settingsStore', () => {
    const isDarkMode = ref(true);
    const voiceSpeech: Ref<UnwrapRef<SpeechSynthesisVoice | null>> = ref(null);

    const initSettings = () => {
        // Инициализируем speechSynthesis, если доступен
        if (window.speechSynthesis) {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
        }

        const theme = (getStorageItem(STORAGE_KEY_THEME) as ThemeType);
        setMode(theme || ThemeType.Dark);

        const speech = getStorageJSON<SpeechSynthesisVoice | null>(STORAGE_KEY_SPEECH, null);
        setVoiceSpeech(speech);
    };

    const toggleMode = () => {
        isDarkMode.value = !isDarkMode.value;
        setClassMode();
    };

    const setMode = (theme: ThemeType) => {
        isDarkMode.value = theme === ThemeType.Dark;
        setClassMode();
    };

    const setClassMode = () => {
        document.documentElement.classList.toggle('ion-palette-dark', isDarkMode.value);
        document.documentElement.classList.toggle('ion-palette-light', !isDarkMode.value);
        const theme = isDarkMode.value ? ThemeType.Dark : ThemeType.Light;
        setStorageItem(STORAGE_KEY_THEME, theme);
    };

    const setVoiceSpeech = (speech: SpeechSynthesisVoice | null) => {
        if (speech) voiceSpeech.value = {
            voiceURI: speech.voiceURI,
            name: speech.name,
            lang: speech.lang,
            localService: speech.localService,
            default: speech.default
        };
        setStorageJSON(STORAGE_KEY_SPEECH, voiceSpeech.value);
    }

    const speakText = (text: string) => {
        speak(text, voiceSpeech.value);
    }

    return {
        isDarkMode,
        voiceSpeech,
        initSettings,
        toggleMode,
        setMode,
        setVoiceSpeech,
        speakText
    };
});
