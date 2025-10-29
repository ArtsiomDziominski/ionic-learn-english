import {defineStore} from 'pinia';
import {computed, Ref, ref, UnwrapRef} from "vue";
import {STORAGE_KEY_STUDY_DAYS, STORAGE_KEY_LAST_STUDY_DATE} from "@/const/const";

export interface StudyDay {
    date: string; // YYYY-MM-DD format
    completed: boolean;
}

export const statisticsStore = defineStore('statisticsStore', () => {
    const studyDays: Ref<UnwrapRef<StudyDay[]>> = ref([]);
    const lastStudyDate: Ref<UnwrapRef<string | null>> = ref(null);

    const totalStudyDays = computed((): UnwrapRef<number> => {
        return studyDays.value.filter(day => day.completed).length;
    });

    const currentStreak = computed((): UnwrapRef<number> => {
        if (studyDays.value.length === 0) return 0;
        
        let streak = 0;
        const sortedDays = [...studyDays.value].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        for (const day of sortedDays) {
            if (day.completed) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    });

    const loadStatistics = (): void => {
        studyDays.value = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDY_DAYS) || '[]');
        lastStudyDate.value = localStorage.getItem(STORAGE_KEY_LAST_STUDY_DATE);
    };

    const saveStatistics = (): void => {
        localStorage.setItem(STORAGE_KEY_STUDY_DAYS, JSON.stringify(studyDays.value));
        if (lastStudyDate.value) {
            localStorage.setItem(STORAGE_KEY_LAST_STUDY_DATE, lastStudyDate.value);
        }
    };

    const addStudyDay = (): void => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Проверяем, не был ли уже добавлен день сегодня
        if (lastStudyDate.value === today) {
            return; // Уже добавлен сегодня
        }

        // Добавляем новый день обучения
        studyDays.value.push({
            date: today,
            completed: true
        });

        // Обновляем последнюю дату обучения
        lastStudyDate.value = today;

        // Сохраняем в localStorage
        saveStatistics();
    };

    const getStudyDayByDate = (date: string): StudyDay | undefined => {
        return studyDays.value.find(day => day.date === date);
    };

    const hasStudiedToday = computed((): boolean => {
        const today = new Date().toISOString().split('T')[0];
        return lastStudyDate.value === today;
    });

    const getStudyDaysThisWeek = computed((): number => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        return studyDays.value.filter(day => {
            const dayDate = new Date(day.date);
            return dayDate >= startOfWeek && day.completed;
        }).length;
    });

    const getStudyDaysThisMonth = computed((): number => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        return studyDays.value.filter(day => {
            const dayDate = new Date(day.date);
            return dayDate >= startOfMonth && day.completed;
        }).length;
    });

    const getAverageStudyDaysPerWeek = computed((): number => {
        if (studyDays.value.length === 0) return 0;
        
        const firstStudyDate = new Date(Math.min(...studyDays.value.map(day => new Date(day.date).getTime())));
        const today = new Date();
        const weeksPassed = Math.max(1, Math.ceil((today.getTime() - firstStudyDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
        
        return Math.round((totalStudyDays.value / weeksPassed) * 10) / 10;
    });

    return {
        studyDays,
        lastStudyDate,
        totalStudyDays,
        currentStreak,
        hasStudiedToday,
        getStudyDaysThisWeek,
        getStudyDaysThisMonth,
        getAverageStudyDaysPerWeek,
        loadStatistics,
        addStudyDay,
        getStudyDayByDate,
        saveStatistics
    };
});
