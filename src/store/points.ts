import {defineStore} from 'pinia';
import {computed, Ref, ref, UnwrapRef} from "vue";
import {STORAGE_KEY_USER_POINTS, STORAGE_KEY_DAILY_REPEATS} from "@/const/const";

export interface DailyRepeat {
    date: string; // YYYY-MM-DD format
    repeatCount: number; // количество повторений в этот день
}

export const pointsStore = defineStore('pointsStore', () => {
    const userPoints: Ref<UnwrapRef<number>> = ref(0);
    const dailyRepeats: Ref<UnwrapRef<DailyRepeat[]>> = ref([]);

    const totalPoints = computed((): UnwrapRef<number> => {
        return userPoints.value;
    });

    const todayRepeatCount = computed((): UnwrapRef<number> => {
        const today = new Date().toISOString().split('T')[0];
        const todayRepeat = dailyRepeats.value.find(repeat => repeat.date === today);
        return todayRepeat ? todayRepeat.repeatCount : 0;
    });

    const nextPointsReward = computed((): UnwrapRef<number> => {
        return (todayRepeatCount.value + 1) * 5;
    });

    const loadPoints = (): void => {
        userPoints.value = parseInt(localStorage.getItem(STORAGE_KEY_USER_POINTS) || '0');
        dailyRepeats.value = JSON.parse(localStorage.getItem(STORAGE_KEY_DAILY_REPEATS) || '[]');
    };

    const savePoints = (): void => {
        localStorage.setItem(STORAGE_KEY_USER_POINTS, userPoints.value.toString());
        localStorage.setItem(STORAGE_KEY_DAILY_REPEATS, JSON.stringify(dailyRepeats.value));
    };

    const addPointsForStudyCompletion = (): void => {
        const today = new Date().toISOString().split('T')[0];
        
        // Находим или создаем запись для сегодняшнего дня
        let todayRepeat = dailyRepeats.value.find(repeat => repeat.date === today);
        
        if (!todayRepeat) {
            todayRepeat = {
                date: today,
                repeatCount: 0
            };
            dailyRepeats.value.push(todayRepeat);
        }

        // Увеличиваем счетчик повторений
        todayRepeat.repeatCount += 1;
        
        // Начисляем баллы (5, 10, 15... за каждое повторение в день)
        const pointsToAdd = todayRepeat.repeatCount * 5;
        userPoints.value += pointsToAdd;

        // Сохраняем данные
        savePoints();
    };

    const spendPoints = (amount: number): boolean => {
        if (userPoints.value >= amount) {
            userPoints.value -= amount;
            savePoints();
            return true;
        }
        return false;
    };

    const canAfford = (amount: number): boolean => {
        return userPoints.value >= amount;
    };

    const getPointsHistory = computed((): DailyRepeat[] => {
        return [...dailyRepeats.value].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    });

    const getPointsThisWeek = computed((): number => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        return dailyRepeats.value
            .filter(repeat => {
                const repeatDate = new Date(repeat.date);
                return repeatDate >= startOfWeek;
            })
            .reduce((total, repeat) => {
                // Суммируем баллы за каждый день (5+10+15+... = 5*1 + 5*2 + 5*3 + ...)
                return total + 5 * (repeat.repeatCount * (repeat.repeatCount + 1)) / 2;
            }, 0);
    });

    const getPointsThisMonth = computed((): number => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        return dailyRepeats.value
            .filter(repeat => {
                const repeatDate = new Date(repeat.date);
                return repeatDate >= startOfMonth;
            })
            .reduce((total, repeat) => {
                // Суммируем баллы за каждый день (5+10+15+... = 5*1 + 5*2 + 5*3 + ...)
                return total + 5 * (repeat.repeatCount * (repeat.repeatCount + 1)) / 2;
            }, 0);
    });

    const resetDailyRepeats = (): void => {
        // Эта функция может быть вызвана при смене дня
        // В текущей реализации счетчик автоматически сбрасывается при новом дне
        // так как мы проверяем дату при каждом начислении баллов
    };

    return {
        userPoints,
        dailyRepeats,
        totalPoints,
        todayRepeatCount,
        nextPointsReward,
        loadPoints,
        savePoints,
        addPointsForStudyCompletion,
        spendPoints,
        canAfford,
        getPointsHistory,
        getPointsThisWeek,
        getPointsThisMonth,
        resetDailyRepeats
    };
});
