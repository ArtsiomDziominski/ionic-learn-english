<script setup lang="ts">
import {checkmarkCircleOutline} from "ionicons/icons";
import {IonIcon} from '@ionic/vue';
import AppConfetti from "@/components/AppConfetti.vue";

</script>

<template>
  <div class="words-study">
      <ion-icon :icon="checkmarkCircleOutline" size="large" color="medium"/>
      <AppConfetti />
  </div>
</template>

<style scoped lang="scss">
.words-study {
  display: flex;
  flex-direction: column;
  margin: auto;
  justify-content: center;
  align-items: center;
}
</style>