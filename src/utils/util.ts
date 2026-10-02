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
