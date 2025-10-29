<template>
  <ion-page>
    <ion-header>
      <HeaderToolbarMainPages title="Профиль" />
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <div class="profile-container">
        <!-- Hero Section -->
        <ProfileHeroSection 
          :avatar-image="avatarImage"
          @open-avatar-options="openAvatarOptions"
        />

        <!-- Main Statistics -->
        <ProfileStatsGrid
          :total-study-days="totalStudyDays"
          :current-streak="currentStreak"
          :studied-words-count="studiedWordsCount"
          :favorites-count="favoritesCount"
          :get-study-days-this-week="getStudyDaysThisWeek"
          :get-average-study-days-per-week="getAverageStudyDaysPerWeek"
          :total-points="totalPoints"
          :today-repeat-count="todayRepeatCount"
        />

        <!-- Progress Section -->
        <ProfileProgressSection
          :has-studied-today="hasStudiedToday"
          :best-streak="bestStreak"
          :best-streak-percentage="bestStreakPercentage"
        />

        <!-- Points Section -->
        <ProfilePointsSection
          :total-points="totalPoints"
          :get-points-this-week="getPointsThisWeek"
          :get-points-this-month="getPointsThisMonth"
        />

        <!-- Recent Activity -->
        <ProfileActivitySection
          :recent-study-days="recentStudyDays"
        />

        <!-- Motivational Section -->
        <ProfileAchievementsSection
          :achievements="achievements"
          :unlocked-achievements-count="unlockedAchievementsCount"
          :total-achievements-count="totalAchievementsCount"
        />
      </div>
    </ion-content>

    <!-- Avatar Action Sheet -->
    <ion-action-sheet
      :is-open="isActionSheetOpen"
      header="Выберите аватарку"
      :buttons="[
        {
          text: 'Сделать фото',
          icon: cameraOutline,
          handler: () => {
            takePhoto();
            closeActionSheet();
          }
        },
        {
          text: 'Выбрать из галереи',
          icon: imageOutline,
          handler: () => {
            selectImageFromGallery();
            closeActionSheet();
          }
        },
        {
          text: 'Удалить аватарку',
          icon: closeCircleOutline,
          role: 'destructive',
          handler: () => {
            removeAvatar();
            closeActionSheet();
          }
        },
        {
          text: 'Отмена',
          role: 'cancel',
          handler: closeActionSheet
        }
      ]"
      @did-dismiss="closeActionSheet"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonContent, 
  IonIcon,
  IonActionSheet
} from '@ionic/vue';
import { 
  cameraOutline,
  imageOutline,
  closeCircleOutline,
  trophyOutline,
  medalOutline,
  rocketOutline,
  trendingUpOutline,
  heartOutline,
  timeOutline,
  diamondOutline,
  shieldOutline,
  flashOutline,
  schoolOutline,
  libraryOutline,
  languageOutline,
  globeOutline,
  peopleOutline,
  speedometerOutline,
  pulseOutline,
  refreshOutline,
  checkmarkOutline,
  calendarOutline,
  bookOutline,
  starOutline
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import HeaderToolbarMainPages from '@/components/header/HeaderToolbarMainPages.vue';
import {
  ProfileHeroSection,
  ProfileStatsGrid,
  ProfileProgressSection,
  ProfilePointsSection,
  ProfileActivitySection,
  ProfileAchievementsSection
} from '@/components/profile';
import { statisticsStore } from '@/store/statistics';
import { vocabularyStore } from '@/store/vocabulary';
import { pointsStore } from '@/store/points';
import { storeToRefs } from 'pinia';

const storeStatistics = statisticsStore();
const storeVocabulary = vocabularyStore();
const storePoints = pointsStore();
const { 
  totalStudyDays, 
  currentStreak, 
  hasStudiedToday, 
  studyDays,
  getStudyDaysThisWeek,
  getStudyDaysThisMonth,
  getAverageStudyDaysPerWeek
} = storeToRefs(storeStatistics);
const { 
  countStudiedWords: studiedWordsCount, 
  countFavoritesWords: favoritesCount 
} = storeToRefs(storeVocabulary);
const {
  totalPoints,
  todayRepeatCount,
  getPointsThisWeek,
  getPointsThisMonth
} = storeToRefs(storePoints);

// Avatar state
const avatarImage = ref<string | null>(null);
const isActionSheetOpen = ref(false);

onMounted(() => {
  storeStatistics.loadStatistics();
  storeVocabulary.setStudiedWords();
  storeVocabulary.setFavoritesWord();
  storePoints.loadPoints();
  loadAvatar();
});

// Avatar functions
const loadAvatar = () => {
  const savedAvatar = localStorage.getItem('userAvatar');
  if (savedAvatar) {
    avatarImage.value = savedAvatar;
  }
};

const saveAvatar = (imageData: string) => {
  localStorage.setItem('userAvatar', imageData);
  avatarImage.value = imageData;
};

const selectImageFromGallery = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    });
    
    if (image.dataUrl) {
      saveAvatar(image.dataUrl);
    }
  } catch (error) {
    console.error('Error selecting image:', error);
  }
};

const takePhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });
    
    if (image.dataUrl) {
      saveAvatar(image.dataUrl);
    }
  } catch (error) {
    console.error('Error taking photo:', error);
  }
};

const openAvatarOptions = () => {
  isActionSheetOpen.value = true;
};

const closeActionSheet = () => {
  isActionSheetOpen.value = false;
};

const removeAvatar = () => {
  localStorage.removeItem('userAvatar');
  avatarImage.value = null;
};

const bestStreak = computed(() => {
  let maxStreak = 0;
  let currentStreak = 0;
  
  const sortedDays = [...studyDays.value].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  for (const day of sortedDays) {
    if (day.completed) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
});

const bestStreakPercentage = computed(() => {
  return Math.min((bestStreak.value / 30) * 100, 100);
});

const recentStudyDays = computed(() => {
  return [...studyDays.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);
});

const achievements = computed(() => [
  // Начальные достижения
  {
    id: 1,
    title: 'Первые шаги',
    description: 'Изучите первый день',
    icon: rocketOutline,
    unlocked: totalStudyDays.value >= 1
  },
  {
    id: 2,
    title: 'Начало пути',
    description: 'Изучите 3 дня',
    icon: schoolOutline,
    unlocked: totalStudyDays.value >= 3
  },
  {
    id: 3,
    title: 'Первая неделя',
    description: 'Изучите 7 дней',
    icon: calendarOutline,
    unlocked: totalStudyDays.value >= 7
  },
  
  // Серии обучения
  {
    id: 4,
    title: 'Неделя подряд',
    description: 'Изучайте 7 дней подряд',
    icon: trophyOutline,
    unlocked: bestStreak.value >= 7
  },
  {
    id: 5,
    title: 'Две недели',
    description: 'Изучайте 14 дней подряд',
    icon: shieldOutline,
    unlocked: bestStreak.value >= 14
  },
  {
    id: 6,
    title: 'Месяц обучения',
    description: 'Изучайте 30 дней подряд',
    icon: medalOutline,
    unlocked: bestStreak.value >= 30
  },
  {
    id: 7,
    title: 'Легенда',
    description: 'Изучайте 100 дней подряд',
    icon: diamondOutline,
    unlocked: bestStreak.value >= 100
  },
  
  // Словарный запас
  {
    id: 8,
    title: 'Первые слова',
    description: 'Изучите 10 слов',
    icon: bookOutline,
    unlocked: studiedWordsCount.value >= 10
  },
  {
    id: 9,
    title: 'Словарный запас',
    description: 'Изучите 50 слов',
    icon: libraryOutline,
    unlocked: studiedWordsCount.value >= 50
  },
  {
    id: 10,
    title: 'Словарный мастер',
    description: 'Изучите 100 слов',
    icon: languageOutline,
    unlocked: studiedWordsCount.value >= 100
  },
  {
    id: 11,
    title: 'Лингвист',
    description: 'Изучите 250 слов',
    icon: globeOutline,
    unlocked: studiedWordsCount.value >= 250
  },
  {
    id: 12,
    title: 'Полиглот',
    description: 'Изучите 500 слов',
    icon: peopleOutline,
    unlocked: studiedWordsCount.value >= 500
  },
  {
    id: 13,
    title: 'Мастер слов',
    description: 'Изучите 1000 слов',
    icon: starOutline,
    unlocked: studiedWordsCount.value >= 1000
  },
  
  // Избранные слова
  {
    id: 14,
    title: 'Первые избранные',
    description: 'Добавьте 5 слов в избранное',
    icon: heartOutline,
    unlocked: favoritesCount.value >= 5
  },
  {
    id: 15,
    title: 'Коллекционер',
    description: 'Добавьте 25 слов в избранное',
    icon: heartOutline,
    unlocked: favoritesCount.value >= 25
  },
  {
    id: 16,
    title: 'Любитель слов',
    description: 'Добавьте 50 слов в избранное',
    icon: heartOutline,
    unlocked: favoritesCount.value >= 50
  },
  
  // Баллы
  {
    id: 17,
    title: 'Первые баллы',
    description: 'Заработайте 100 баллов',
    icon: starOutline,
    unlocked: totalPoints.value >= 100
  },
  {
    id: 18,
    title: 'Сборщик баллов',
    description: 'Заработайте 500 баллов',
    icon: diamondOutline,
    unlocked: totalPoints.value >= 500
  },
  {
    id: 19,
    title: 'Балльный мастер',
    description: 'Заработайте 1000 баллов',
    icon: trophyOutline,
    unlocked: totalPoints.value >= 1000
  },
  {
    id: 20,
    title: 'Балльный чемпион',
    description: 'Заработайте 2500 баллов',
    icon: medalOutline,
    unlocked: totalPoints.value >= 2500
  },
  {
    id: 21,
    title: 'Балльная легенда',
    description: 'Заработайте 5000 баллов',
    icon: diamondOutline,
    unlocked: totalPoints.value >= 5000
  },
  
  // Активность
  {
    id: 22,
    title: 'Активный ученик',
    description: 'Изучите 15 дней',
    icon: pulseOutline,
    unlocked: totalStudyDays.value >= 15
  },
  {
    id: 23,
    title: 'Постоянный ученик',
    description: 'Изучите 30 дней',
    icon: speedometerOutline,
    unlocked: totalStudyDays.value >= 30
  },
  {
    id: 24,
    title: 'Преданный ученик',
    description: 'Изучите 60 дней',
    icon: flashOutline,
    unlocked: totalStudyDays.value >= 60
  },
  {
    id: 25,
    title: 'Мастер обучения',
    description: 'Изучите 100 дней',
    icon: trophyOutline,
    unlocked: totalStudyDays.value >= 100
  },
  {
    id: 26,
    title: 'Гранд-мастер',
    description: 'Изучите 200 дней',
    icon: diamondOutline,
    unlocked: totalStudyDays.value >= 200
  },
  
  // Еженедельные достижения
  {
    id: 27,
    title: 'Недельный герой',
    description: 'Изучайте 5 дней на этой неделе',
    icon: calendarOutline,
    unlocked: getStudyDaysThisWeek.value >= 5
  },
  {
    id: 28,
    title: 'Идеальная неделя',
    description: 'Изучайте 7 дней на этой неделе',
    icon: checkmarkOutline,
    unlocked: getStudyDaysThisWeek.value >= 7
  },
  
  // Повторения
  {
    id: 29,
    title: 'Повторение - мать учения',
    description: 'Сделайте 10 повторений за день',
    icon: refreshOutline,
    unlocked: todayRepeatCount.value >= 10
  },
  {
    id: 30,
    title: 'Мастер повторений',
    description: 'Сделайте 25 повторений за день',
    icon: refreshOutline,
    unlocked: todayRepeatCount.value >= 25
  },
  {
    id: 31,
    title: 'Король повторений',
    description: 'Сделайте 50 повторений за день',
    icon: refreshOutline,
    unlocked: todayRepeatCount.value >= 50
  },
  
  // Специальные достижения
  {
    id: 32,
    title: 'Ранняя пташка',
    description: 'Изучайте утром 5 дней подряд',
    icon: timeOutline,
    unlocked: false // Можно добавить логику для утренних занятий
  },
  {
    id: 33,
    title: 'Ночная сова',
    description: 'Изучайте вечером 5 дней подряд',
    icon: timeOutline,
    unlocked: false // Можно добавить логику для вечерних занятий
  },
  {
    id: 34,
    title: 'Выходной воин',
    description: 'Изучайте в выходные 4 дня подряд',
    icon: calendarOutline,
    unlocked: false // Можно добавить логику для выходных дней
  }
]);

const unlockedAchievementsCount = computed(() => {
  return achievements.value.filter(achievement => achievement.unlocked).length;
});

const totalAchievementsCount = computed(() => {
  return achievements.value.length;
});

</script>

<style scoped lang="scss">
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 20px;
}
</style>
