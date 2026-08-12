<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Deck } from '@/types/deck'

defineProps<{ deck: Deck }>()
const emit = defineEmits<{ delete: [] }>()
</script>

<template>
  <div class="flex flex-col justify-between rounded-md border border-slate-200 bg-white p-4">
    <div>
      <RouterLink
        :to="{ name: 'deck-detail', params: { id: deck.id } }"
        class="text-lg font-medium hover:underline"
      >
        {{ deck.name }}
      </RouterLink>
      <p class="mt-1 text-sm text-slate-500">
        {{ deck.cards.length }} card{{ deck.cards.length === 1 ? '' : 's' }}
      </p>
    </div>
    <button
      type="button"
      class="mt-3 self-start text-xs text-slate-400 hover:text-red-600"
      @click="emit('delete')"
    >
      Delete deck
    </button>
  </div>
</template>
