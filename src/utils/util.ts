export const speak = (text: string, speech: SpeechSynthesisVoice | null) => {
    const speechSynthesis = window.speechSynthesis;
    
    // Проверяем доступность Web Speech API
    if (!speechSynthesis) {
        console.warn('Web Speech API is not available');
        return;
    }
    
    speechSynthesis.cancel();  // Останавливаем текущее озвучивание
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices()?.find((item) => item.voiceURI === speech?.voiceURI) ||
        speechSynthesis.getVoices().find((item) => item.lang.includes('en')) || speechSynthesis.getVoices()[0];
    utterance.rate = 1; // Скорость речи (по умолчанию 1)
    speechSynthesis.speak(utterance);
}

// export const speak = async (text: string): Promise<void> => {
//     console.log(speechSynthesis.getVoices());
//     try {
//         await TextToSpeech.speak({
//             text: text,
//             rate: 0.9,
//         });
//     } catch (error) {
//         console.error('Error:', error);
//     }
// };


export const addUniqueElements = (array: any, newElements: any, key: string) => {
    const uniqueArray = Array.from(new Map(array.map((item: any) => [item[key], item])).values());
    newElements.forEach((item: any) => {
        if (!uniqueArray.some(existingItem => (existingItem as any)[key] === item[key])) {
            uniqueArray.push(item);
        }
    });
    return uniqueArray;
}