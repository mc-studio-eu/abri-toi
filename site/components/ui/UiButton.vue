<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to?: string
    label?: string
    variant?: 'primary' | 'dark' | 'outline'
    icon?: boolean
  }>(),
  { to: '#contact', label: 'Prendre rendez-vous', variant: 'primary', icon: true },
)

const arrow = computed(() => (props.variant === 'dark' ? '/images/arrow-cream.svg' : '/images/arrow-white.svg'))
</script>

<template>
  <NuxtLink :to="to" class="btn" :class="`btn--${variant}`">
    <span>{{ label }}</span>
    <img v-if="icon && variant !== 'outline'" :src="arrow" alt="" width="16" height="16" class="btn__icon" />
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

.btn__icon {
  transition: transform 0.2s;
}

.btn:hover .btn__icon {
  transform: translateX(3px);
}

.btn--primary {
  background: var(--orange-500);
  color: var(--white);
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
</style>
