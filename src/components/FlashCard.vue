<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Card } from '@/types/deck'

const props = defineProps<{ card: Card }>()

const flipped = ref(false)

watch(
  () => props.card.id,
  () => {
    flipped.value = false
  },
)

function toggleFlip() {
  flipped.value = !flipped.value
}
</script>

<template>
  <button
    type="button"
    class="flex h-56 w-full flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm"
    @click="toggleFlip"
  >
    <p class="text-xs uppercase tracking-wide text-slate-400">
      {{ flipped ? 'Meaning' : 'Term' }}
    </p>
    <p class="mt-3 text-2xl font-semibold">
      {{ flipped ? card.meaning : card.term }}
    </p>
    <p v-if="flipped && card.notes" class="mt-2 text-sm text-slate-500">{{ card.notes }}</p>
    <p class="mt-4 text-xs text-slate-400">Tap to flip</p>
  </button>
</template>
