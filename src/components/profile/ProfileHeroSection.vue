<template>
  <div class="hero-section glass-card glass-card-large">
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
.hero-section {
  margin-bottom: 24px;
  padding: 32px;
  background: var(--glass-gradient-primary);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ion-icon {
    font-size: 24px;
    color: white;
  }
}

.avatar:hover .avatar-overlay {
  opacity: 1;
}

.user-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.user-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

@media (max-width: 768px) {
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }
}
</style>
