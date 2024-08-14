<script setup lang="ts">
import {IonSelect, IonSelectOption} from '@ionic/vue';

defineProps({
  value: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  }
})

</script>

<template>
  <ion-select
      :value="value"
      :label="label"
      label-placement="floating"
      @ionChange="($event) => $emit('ionChange', $event)"
      @ionCancel="() => $emit('ionCancel')"
      @ionDismiss="() => $emit('ionDismiss')"
  >
    <ion-select-option
        v-for="option in options"
        :key="String(option)"
        :value="option"
    >
      {{ option }}
    </ion-select-option>
  </ion-select>
</template>

<style scoped lang="scss">

</style>