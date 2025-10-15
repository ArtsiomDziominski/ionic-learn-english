<script setup lang="ts">
import {IonCard, IonCardContent} from "@ionic/vue";
import {PropType} from "vue";

defineProps({
  letter: {
    type: Object as PropType<string>,
    required: true
  },
  count: {
    type: Number,
    required: false,
    default: 0
  },
});
</script>

<template>
  <div class="wrapper-letter">
    <ion-card color="medium" class="letter">
      <ion-card-content class="letter__content content ion-no-padding">
        <ion-text class="content__text">
          {{ letter }}
        </ion-text>
      </ion-card-content>
    </ion-card>
    <ion-badge v-if="count > 1" class="badge">{{ count }}</ion-badge>
  </div>
</template>

<style scoped lang="scss">
.wrapper-letter {
  position: relative;
  width: 50px;
  text-align: center;

  .letter {
    margin: 0;
    transition: transform 0.3s ease;
    cursor: pointer;

    &:active {
      transform: scale(0.9);
    }

    &__content {
      padding: 6px 10px;

      .content {
        position: relative;

        &__text {
          font-size: 42px;
        }
      }
    }
  }

  .badge {
    position: absolute;
    z-index: 1000;
    top: -8px;
    right: -4px;
  }
}
</style>
