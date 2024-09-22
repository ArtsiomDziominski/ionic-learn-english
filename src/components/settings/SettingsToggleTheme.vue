<script setup lang="ts">
import {settingsStore} from "@/store/settings";
import {storeToRefs} from "pinia";
import {IonToggle} from '@ionic/vue';
import AppSelect from "@/components/UI/AppSelect.vue";
import {computed} from "vue";
import {VoiceSpeech} from "@/const/const";

const storeSettings = settingsStore();
const {isDarkMode, voiceSpeech} = storeToRefs(storeSettings);

const toggleMode = () => {
  storeSettings.toggleMode();
};

const valueVoiceSpeech = computed(() => {
  return voiceSpeech.value?.voiceURI || null;
});

const speechList = computed((): string[] => {
  const speechSynthesisVoices = window.speechSynthesis.getVoices();
  const speechSynthesisVoicesEnglish = speechSynthesisVoices.filter((speech) => speech.lang.includes('en'));
  return speechSynthesisVoicesEnglish.map((speech) => speech.voiceURI);
});

const changeSpeech = (event: any) => {
  const speech = event?.detail?.value as keyof typeof VoiceSpeech;
  const speechSynthesisVoices = window.speechSynthesis.getVoices();
  if (speech) storeSettings.setVoiceSpeech(speechSynthesisVoices.find((item) => item.voiceURI === speech) || null);
};

</script>

<template>
  <ion-content>
    <!--    <ion-list-header>Appearance</ion-list-header>-->
    <div class="content">

      <ion-list :inset="true">
              <ion-item :button="true" class="speech">
                <AppSelect label="Speech" :value="valueVoiceSpeech" :options="speechList" @ionChange="changeSpeech"/>
              </ion-item>

        <ion-item>
          <ion-toggle :checked="isDarkMode" @ion-change="toggleMode" justify="space-between">Dark mode</ion-toggle>
        </ion-item>
      </ion-list>

      <!--    <ion-list-header>Brightness</ion-list-header>-->
      <!--    <ion-list :inset="true">-->
      <!--      <ion-item>-->
      <!--        <ion-range value="40">-->
      <!--          <ion-icon :icon="sunnyOutline" slot="start"></ion-icon>-->
      <!--          <ion-icon :icon="sunny" slot="end"></ion-icon>-->
      <!--        </ion-range>-->
      <!--      </ion-item>-->
      <!--      <ion-item>-->
      <!--        <ion-toggle justify="space-between" checked>True Tone</ion-toggle>-->
      <!--      </ion-item>-->
      <!--    </ion-list>-->

      <!--    <ion-list :inset="true">-->
      <!--      <ion-item :button="true">-->
      <!--        <ion-label>Night Shift</ion-label>-->
      <!--        <ion-text slot="end" color="medium">9:00 PM to 8:00 AM</ion-text>-->
      <!--      </ion-item>-->
      <!--    </ion-list>-->
    </div>
  </ion-content>
</template>

<style scoped lang="scss">
.speech {
  padding: 0 12px;
}

.content {
  padding: 0 36px;
}
</style>