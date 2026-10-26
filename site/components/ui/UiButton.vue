<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to?: string
    label?: string
    variant?: 'primary' | 'dark' | 'outline' | 'outline-dark'
    icon?: boolean
    // Bouton arrondi des pages intérieures (composant Figma « Button »)
    pill?: boolean
    submit?: boolean
    disabled?: boolean
  }>(),
  { to: '/contact', label: 'Prendre rendez-vous', variant: 'primary', icon: true },
)

const arrow = computed(() => {
  if (props.variant === 'dark') return '/images/arrow-cream.svg'
  if (props.variant === 'outline-dark') return '/images/arrow-brown-900.svg'
  return '/images/arrow-white.svg'
})
const showIcon = computed(() => props.icon && props.variant !== 'outline')
const classes = computed(() => ['btn', `btn--${props.variant}`, { 'btn--pill': props.pill }])
</script>

<template>
  <button v-if="submit" type="submit" :class="classes" :disabled="disabled">
    <span>{{ label }}</span>
    <img v-if="showIcon" :src="arrow" alt="" width="16" height="16" class="btn__icon" />
  </button>
  <NuxtLink v-else :to="to" :class="classes">
    <span>{{ label }}</span>
    <img v-if="showIcon" :src="arrow" alt="" width="16" height="16" class="btn__icon" />
  </NuxtLink>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px 14px 22px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 16px;
  line-height: normal;
  white-space: nowrap;
  transition: background-color 0.2s, color 0.2s, transform 0.2s;
}

.btn--pill {
  border-radius: 999px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.btn__icon {
  transition: transform 0.2s;
}

.btn:hover .btn__icon {
  transform: translateX(3px);
}

.btn--primary {
  background: var(--orange-500);
  color: var(--paper);
}

.btn--primary:hover {
  background: var(--orange-600);
}

.btn--dark {
  background: var(--brown-900);
  color: var(--cream);
}

.btn--dark:hover {
  background: #2c1a14;
}

.btn--outline {
  border: 1.2px solid var(--white);
  color: var(--white);
  padding-right: 22px;
}

.btn--outline:hover {
  background: rgba(255, 255, 255, 0.12);
}

.btn--outline-dark {
  border: 1.2px solid var(--brown-900);
  color: var(--brown-900);
}

.btn--outline-dark:hover {
  background: rgba(63, 38, 29, 0.06);
}
</style>
