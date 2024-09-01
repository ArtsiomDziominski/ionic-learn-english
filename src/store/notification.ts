import {defineStore} from 'pinia';
import {ref} from "vue";

export const notificationStore = defineStore('notificationStore', () => {
    const notifications = ref<NOTIFICATION.Notification[]>([]);

    const addNotification = (message: string, type: 'success' | 'error' = 'error') => {
        const id = Date.now();
        notifications.value.push({ id, message, type });

        setTimeout(() => removeNotification(id), 3000);
    };

    const removeNotification = (id: number) => {
        notifications.value = notifications.value.filter(notification => notification.id !== id);
    };
    return {
        notifications,
        addNotification,
        removeNotification
    };
});
