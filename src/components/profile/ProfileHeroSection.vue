<template>
  <div class="hero-section app-card app-card">
    <div class="hero-content">
      <div class="avatar-section">
        <div class="avatar" @click="handleAvatarClick">
          <img 
            v-if="avatarImage" 
            :src="avatarImage" 
            alt="Avatar" 
            class="avatar-image"
          />
          <ion-icon 
            v-else 
            :icon="personCircleOutline" 
            size="large" 
          />
          <div class="avatar-overlay">
            <ion-icon :icon="cameraOutline" />
          </div>
        </div>
        <div class="user-info">
          <h1 class="user-name">Изучающий английский</h1>
          <p class="user-subtitle">Продолжайте в том же духе!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { 
  personCircleOutline, 
  cameraOutline 
} from 'ionicons/icons';

interface Props {
  avatarImage: string | null;
}

interface Emits {
  (e: 'open-avatar-options'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleAvatarClick = () => {
  emit('open-avatar-options');
};
</script>

<style scoped lang="scss">
/* Компактная шапка профиля: аватар и имя в строку.
   Раньше блок занимал полэкрана под градиентом и не нёс данных. */
.hero-section {
  padding: var(--app-sp-5);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: var(--app-sp-4);
}

.avatar {
  position: relative;
  width: 64px;
  height: 64px;
  flex: 0 0 64px;
  display: grid;
  place-items: center;
  border-radius: var(--app-r-pill);
  background: var(--app-tint-primary);
  color: var(--app-accent-ink);
  font-size: 34px;
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--app-dur-fast) var(--app-ease);

  &:active {
    transform: scale(0.94);
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Подсказка «можно сменить фото» — маленький значок камеры в углу,
   а не оверлей поверх всего аватара */
.avatar-overlay {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: var(--app-r-pill);
  background: var(--ion-color-primary);
  color: var(--app-text-on-accent);
  border: 2px solid var(--app-surface);
  font-size: 12px;
}

.user-info {
  min-width: 0;
}

.user-name {
  font-size: var(--app-fs-h2);
  font-weight: 700;
  color: var(--app-text);
  margin: 0;
}

.user-subtitle {
  font-size: var(--app-fs-sm);
  color: var(--app-text-muted);
  margin: 2px 0 0;
}
</style>
