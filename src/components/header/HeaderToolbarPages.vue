<script setup lang="ts">
import {chevronBackOutline} from "ionicons/icons";
import {IonToolbar, IonIcon, useIonRouter} from '@ionic/vue';

defineProps({
  title: {
    type: String,
    default: ''
  }
})

const ionRouter = useIonRouter();

const toBack = (): void => {
  ionRouter.back();
}

</script>

<template>
  <ion-toolbar>
    <div class="toolbar">
      <button type="button" class="toolbar__back" aria-label="Назад" @click="toBack">
        <ion-icon :icon="chevronBackOutline" />
      </button>
      <h1 class="toolbar__title">{{ title }}</h1>
    </div>
  </ion-toolbar>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--app-sp-1);
  padding: 0 var(--app-sp-2);

  /* Кнопка «назад» — полноценная зона нажатия 44px.
     Раньше это была ion-button с невалидным атрибутом icon. */
  &__back {
    width: var(--app-tap);
    height: var(--app-tap);
    flex: 0 0 var(--app-tap);
    display: grid;
    place-items: center;
    border: 0;
    padding: 0;
    background: transparent;
    color: var(--app-text);
    font-size: 24px;
    border-radius: var(--app-r-md);
    cursor: pointer;
    transition: background-color var(--app-dur-fast) var(--app-ease);

    &:hover {
      background: var(--app-surface-2);
    }

    &:active {
      background: var(--app-surface-3);
    }
  }

  /* Длинные заголовки статей не должны ломать шапку */
  &__title {
    font-size: var(--app-fs-h2);
    font-weight: 650;
    color: var(--app-text);
    margin: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>