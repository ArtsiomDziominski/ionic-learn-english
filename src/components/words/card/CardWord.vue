<template>
  <ion-card color="primary">
    <ion-card-content class="content">
      <ion-text>
        {{ word }}
      </ion-text>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent } from '@ionic/vue';

defineProps({
  word: {
    type: String,
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