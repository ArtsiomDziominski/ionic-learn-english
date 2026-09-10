<script setup lang="ts">
import {settingsOutline, bookOutline} from "ionicons/icons";
import {IonToolbar, IonIcon, useIonRouter} from '@ionic/vue';
import PointsIndicator from '@/components/PointsIndicator.vue';

defineProps({
  title: {
    type: String,
    default: ''
  }
})

const ionRouter = useIonRouter();

const toSettings = (): void => {
  ionRouter.push('/settings');
}

const toBlog = (): void => {
  ionRouter.push('/article');
}
</script>

<template>
  <ion-toolbar>
    <div class="toolbar">
      <PointsIndicator />

      <div class="toolbar__actions">
        <button type="button" class="toolbar__action" aria-label="Статьи" @click="toBlog">
          <ion-icon :icon="bookOutline" />
        </button>
        <button type="button" class="toolbar__action" aria-label="Настройки" @click="toSettings">
          <ion-icon :icon="settingsOutline" />
        </button>
      </div>
    </div>
  </ion-toolbar>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: var(--app-sp-3);
  padding: 0 var(--app-sp-3);

  &__actions {
    display: flex;
    gap: var(--app-sp-1);
  }

  /* Иконочные кнопки шапки: 44px зона нажатия и цвет из токенов,
     чтобы шапка читалась в обеих темах */
  &__action {
    width: var(--app-tap);
    height: var(--app-tap);
    display: grid;
    place-items: center;
    border: 0;
    padding: 0;
    background: transparent;
    color: var(--app-text-muted);
    font-size: 22px;
    border-radius: var(--app-r-md);
    cursor: pointer;
    transition: background-color var(--app-dur-fast) var(--app-ease),
                color var(--app-dur-fast) var(--app-ease);

    &:hover {
      background: var(--app-surface-2);
      color: var(--app-text);
    }

    &:active {
      background: var(--app-surface-3);
    }
  }
}
</style>
