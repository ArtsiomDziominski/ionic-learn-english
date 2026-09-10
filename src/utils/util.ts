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


// Безопасные обёртки над localStorage: если хранилище недоступно (приватный режим,
// заблокировано настройками браузера) или в нём лежат повреждённые данные,
// приложение не должно падать при старте — используется fallback-значение.
export const getStorageJSON = <T>(key: string, fallback: T): T => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch (error) {
        console.warn(`Не удалось прочитать "${key}" из localStorage`, error);
        return fallback;
    }
}

export const setStorageJSON = (key: string, value: unknown): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Не удалось сохранить "${key}" в localStorage`, error);
    }
}

export const getStorageItem = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn(`Не удалось прочитать "${key}" из localStorage`, error);
        return null;
    }
}

export const setStorageItem = (key: string, value: string): void => {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn(`Не удалось сохранить "${key}" в localStorage`, error);
    }
}

export const removeStorageItem = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn(`Не удалось удалить "${key}" из localStorage`, error);
    }
}

export const addUniqueElements = (array: any, newElements: any, key: string) => {
    const uniqueArray = Array.from(new Map(array.map((item: any) => [item[key], item])).values());
    newElements.forEach((item: any) => {
        if (!uniqueArray.some(existingItem => (existingItem as any)[key] === item[key])) {
            uniqueArray.push(item);
        }
    });
    return uniqueArray;
}