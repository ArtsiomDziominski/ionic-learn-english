<script setup lang="ts">
import {notificationStore} from "@/store/notification";
import {storeToRefs} from "pinia";

const storeNotification = notificationStore();
const {notifications} = storeToRefs(storeNotification);
</script>

<template>
  <div v-if="notifications.length" class="notifications">
    <transition-group name="slide-fade" tag="div">
      <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="notification.type === 'success' ? 'notification-success' : 'notification-error'"
      >
        <p>{{ notification.message }}</p>
        <button class="close-btn" @click="storeNotification.removeNotification(notification.id)">×</button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped lang="scss">
.notifications {
  position: fixed;
  top: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 16px;
}

.notification-error {
  background-color: #f8d7da;
  color: #721c24;
}

.notification-success {
  background-color: #e2f8d7;
  color: #3c721c;
}

.notification {
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 250px;
  width: 100%;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #721c24;
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.slide-fade-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-fade-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.slide-fade-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.notification.closing {
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.slide-fade-move {
  transition: transform 0.5s ease;
}
</style>