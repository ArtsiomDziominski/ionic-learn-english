<template>
  <ion-card color="primary">
    <ion-card-content class="content">
      <ion-text>
        {{ word.translation }}
      </ion-text>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent } from '@ionic/vue';
import {PropType} from "vue";

defineProps({
  word: {
    type: Object as PropType<COMMON.Word>,
    required: true
  },
});
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>