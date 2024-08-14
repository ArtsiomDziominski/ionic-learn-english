import {VoiceSpeech} from "@/const/const";

export const speak = (text: string, speech: VoiceSpeech = VoiceSpeech.Male) => {
    const speechSynthesis = window.speechSynthesis;
    speechSynthesis.cancel();  // Останавливаем текущее озвучивание
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices()[speech]; // Голос
    utterance.rate = 1; // Скорость речи (по умолчанию 1)
    speechSynthesis.speak(utterance);
    console.log(speechSynthesis.getVoices());
}
