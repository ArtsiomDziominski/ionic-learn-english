import {defineStore} from 'pinia';
import {Ref, ref, UnwrapRef} from "vue";
import {STORAGE_KEY_SPEECH, STORAGE_KEY_THEME, ThemeType, VoiceSpeech} from "@/const/const";
import {speak} from "@/utils/util";

export const settingsStore = defineStore('settingsStore', () => {
    const isDarkMode = ref(true);
    const voiceSpeech: Ref<UnwrapRef<VoiceSpeech>> = ref(VoiceSpeech.Male);

    const initSettings = () => {
        const theme = (localStorage.getItem(STORAGE_KEY_THEME) as ThemeType);
        setMode(theme || ThemeType.Dark);

        const speech = (localStorage.getItem(STORAGE_KEY_SPEECH) as VoiceSpeech | undefined);
        setVoiceSpeech(speech || VoiceSpeech.Male);
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
        localStorage.setItem(STORAGE_KEY_THEME, theme);
    };

    const setVoiceSpeech = (speech: VoiceSpeech) => {
        voiceSpeech.value = speech;
        localStorage.setItem(STORAGE_KEY_SPEECH, String(speech));
    }

    const speakText = (text: string) => {
        speak(text);
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
