import {defineStore} from 'pinia';
import {Ref, ref, UnwrapRef} from "vue";
import {STORAGE_KEY_SPEECH, STORAGE_KEY_THEME, ThemeType} from "@/const/const";
import {speak} from "@/utils/util";

export const settingsStore = defineStore('settingsStore', () => {
    const isDarkMode = ref(true);
    const voiceSpeech: Ref<UnwrapRef<SpeechSynthesisVoice | null>> = ref(null);

    const initSettings = () => {
        speechSynthesis.speak(new SpeechSynthesisUtterance(''));

        const theme = (localStorage.getItem(STORAGE_KEY_THEME) as ThemeType);
        setMode(theme || ThemeType.Dark);

        const speechString = (localStorage.getItem(STORAGE_KEY_SPEECH) as SpeechSynthesisVoice | null);
        try {
            const speech = JSON.parse(speechString as any);
            setVoiceSpeech(speech);
        } catch (e) { /* empty */ }

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

    const setVoiceSpeech = (speech: SpeechSynthesisVoice | null) => {
        if (speech) voiceSpeech.value = {
            voiceURI: speech.voiceURI,
            name: speech.name,
            lang: speech.lang,
            localService: speech.localService,
            default: speech.default
        };
        localStorage.setItem(STORAGE_KEY_SPEECH, JSON.stringify(voiceSpeech.value));
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
