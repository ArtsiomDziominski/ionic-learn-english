<script setup lang="ts">
import { useTransfer } from '@/composables/useTransfer';
import GameIcon from '@/components/ui/GameIcon.vue';

const transfer = useTransfer();
</script>

<template>
  <section class="transfer card">
    <div class="transfer__head">
      <GameIcon name="cards" :size="40" />
      <div class="grow">
        <h3 class="transfer__title">Прогресс и перенос</h3>
        <p class="muted">Всё хранится на этом устройстве, без регистрации. Сохраните файл, чтобы продолжить на другом телефоне или в браузере.</p>
      </div>
    </div>

    <div class="transfer__grid">
      <button type="button" class="act card--press" :disabled="transfer.busy.value" @click="transfer.download()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <span>Скачать файл</span>
      </button>
      <button type="button" class="act card--press" :disabled="transfer.busy.value" @click="transfer.chooseFile()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V8m0 0l-4.5 4.5M12 8l4.5 4.5M5 5h14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <span>Загрузить файл</span>
      </button>
      <button type="button" class="act card--press" :disabled="transfer.busy.value" @click="transfer.sendFile()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4L9.5 14.5M20 4l-6.5 16-4-5.5L4 10.5z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <span>Отправить файл</span>
      </button>
      <button type="button" class="act act--accent card--press" :disabled="transfer.busy.value" @click="transfer.shareCard()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5.5" r="2.6" fill="none" stroke="currentColor" stroke-width="2.4" /><circle cx="6" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="2.4" /><circle cx="18" cy="18.5" r="2.6" fill="none" stroke="currentColor" stroke-width="2.4" /><path d="M8.3 10.8l7.4-4M8.3 13.2l7.4 4" stroke="currentColor" stroke-width="2.4" /></svg>
        <span>Поделиться успехами</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.transfer {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.transfer__head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.transfer__title {
  margin-bottom: 2px;
  font-size: 1.1rem;
}

.transfer__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.act {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 86px;
  padding: 12px 8px;
  border: 2px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--surface);
  color: var(--violet-ink);
  font-weight: 900;
  font-size: 0.92rem;
  text-align: center;
}

.act svg {
  width: 28px;
  height: 28px;
}

.act:disabled {
  opacity: 0.6;
  cursor: progress;
}

.act--accent {
  border-color: var(--violet);
  background: var(--violet);
  box-shadow: 0 4px 0 var(--violet-shade);
  color: #fff;
}

.act--accent:active { box-shadow: 0 0 0 var(--violet-shade); }
</style>
