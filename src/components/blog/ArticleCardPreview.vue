<script setup lang="ts">
import {PropType} from "vue";

defineProps({
  article: {
    type: Object as PropType<ARTICLE.Article>,
    default: () => {}
  }
})
</script>

<template>
  <div class="card-preview">
    <img :src="article.img">
    <p>{{article.title}}</p>
  </div>
</template>

<style scoped lang="scss">
.card-preview {
  max-width: max-content;
  width: 100%;
  border-radius: 14px;
  padding: 16px;
  //background: var(--ion-color-tertiary-shade);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  color: #fff;

  &:hover {
    color: var(--ion-color-tertiary-tint);
  }

  img {
    border-radius: 10px;
    overflow: hidden;
  }
}
</style>