<script setup lang="ts">
defineProps({
  word: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: false,
    default: ''
  }
});
</script>

<template>
  <ion-card :color="color">
    <ion-card-content>
      {{ word }}
    </ion-card-content>
  </ion-card>
</template>

<style scoped lang="scss">

</style>