import { computed, ref } from 'vue';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { useSettingsStore } from '@/store/settings';

/**
 * Озвучка английских слов.
 *
 * В браузере — Web Speech API. В Android WebView speechSynthesis
 * нет вовсе, поэтому в приложении работает нативный TTS-плагин.
 * Если английского голоса нет ни там, ни там, задания на слух
 * не выдаются (см. canListen), а кнопки озвучки скрываются.
 */

const native = Capacitor.isNativePlatform();
const voices = ref<SpeechSynthesisVoice[]>([]);
const nativeReady = ref(native);

const loadVoices = (): void => {
  if (native || typeof window === 'undefined' || !window.speechSynthesis) return;
  voices.value = window.speechSynthesis.getVoices().filter((v) => /^en([-_]|$)/i.test(v.lang));
};

if (!native && typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  // Голоса в Chrome приходят асинхронно
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

if (native) {
  TextToSpeech.getSupportedLanguages()
    .then(({ languages }) => {
      nativeReady.value = languages.length === 0 || languages.some((l) => /^en/i.test(l));
    })
    .catch(() => {
      nativeReady.value = false;
    });
}

export const speechAvailable = computed(() => (native ? nativeReady.value : voices.value.length > 0));

export function useSpeech() {
  const store = useSettingsStore();

  const englishVoices = computed(() => voices.value);
  const canListen = computed(() => speechAvailable.value && store.settings.listening);

  const speak = async (text: string, slow = false): Promise<void> => {
    if (!text || !speechAvailable.value) return;
    const rate = store.settings.speechRate * (slow ? 0.65 : 1);
    if (native) {
      try {
        await TextToSpeech.stop();
        await TextToSpeech.speak({ text, lang: 'en-US', rate, pitch: 1, volume: 1, category: 'playback' });
      } catch {
        /* движок TTS недоступен — молча пропускаем */
      }
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const preferred = voices.value.find((v) => v.voiceURI === store.settings.voiceURI)
      ?? voices.value.find((v) => /en[-_]US/i.test(v.lang))
      ?? voices.value[0];
    if (preferred) utterance.voice = preferred;
    utterance.lang = preferred?.lang ?? 'en-US';
    utterance.rate = rate;
    synth.speak(utterance);
  };

  return { speak, englishVoices, canListen, available: speechAvailable, isNative: native };
}
