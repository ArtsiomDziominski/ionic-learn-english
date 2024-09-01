import { VoiceSpeech } from "@/const/const";
import { TextToSpeech } from "@capacitor-community/text-to-speech";

export const speakText = (text: string, speech: VoiceSpeech = VoiceSpeech.Male) => {
    const speechSynthesis = window.speechSynthesis;
    speechSynthesis.cancel();  // Останавливаем текущее озвучивание
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices()[speech]; // Голос
    utterance.rate = 1; // Скорость речи (по умолчанию 1)
    speechSynthesis.speak(utterance);
}

export const speak = async (text: string): Promise<void> => {
    try {
        await TextToSpeech.speak({
            text: text,
            voice: 2,
            rate: 0.9,
        });
    } catch (error) {
        console.error('Error:', error);
    }
};


export const addUniqueElements = (array: any, newElements: any, key: string) => {
    const uniqueArray = Array.from(new Map(array.map((item: any) => [item[key], item])).values());
    newElements.forEach((item: any) => {
        if (!uniqueArray.some(existingItem => (existingItem as any)[key] === item[key])) {
            uniqueArray.push(item);
        }
    });
    return uniqueArray;
}