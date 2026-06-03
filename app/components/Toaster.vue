<script setup lang="ts">
import { AlertTriangle, Check, Info, X } from '@lucide/vue'
import type { Toast } from '../composables/useToast'
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()

const icons = {
  success: Check,
  error: AlertTriangle,
  info: Info,
} as const

function runAction(toast: Toast) {
  toast.onAction?.()
  removeToast(toast.id)
}
</script>

<template>
  <!-- Wrapper is click-through (pointer-events: none); only the toasts capture
       clicks, so it never blocks the content behind empty space. -->
  <div class="toaster" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
        role="status"
        title="Klicken zum Schließen"
        @click="removeToast(toast.id)"
      >
        <component :is="icons[toast.type]" :size="15" class="toast-icon" />
        <span class="toast-msg">{{ toast.message }}</span>
        <button
          v-if="toast.actionLabel"
          type="button"
          class="toast-action"
          @click.stop="runAction(toast)"
        >
          {{ toast.actionLabel }}
        </button>
        <X :size="14" class="toast-close" />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toaster {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 200;
  pointer-events: none;
  max-width: min(90vw, 520px);
}

.toast {
  pointer-events: auto;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-left: 3px solid var(--border);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  font-size: 13px;
  color: var(--text-primary);
}

.toast-success {
  border-left-color: var(--success);
}
.toast-error {
  border-left-color: var(--error);
}
.toast-info {
  border-left-color: var(--info);
}

.toast-success .toast-icon {
  color: var(--success);
}
.toast-error .toast-icon {
  color: var(--error);
}
.toast-info .toast-icon {
  color: var(--info);
}

.toast-icon {
  flex-shrink: 0;
}

.toast-msg {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast-action {
  flex-shrink: 0;
  background: var(--accent);
  border: none;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.toast-action:hover {
  background: var(--accent-hover);
}

.toast-close {
  flex-shrink: 0;
  color: var(--text-muted);
}

/* enter/leave animation */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
