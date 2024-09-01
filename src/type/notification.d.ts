export type Notification = {
    id: number;
    message: string;
    type: 'success' | 'error';
}

export as namespace NOTIFICATION;
