<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDecksStore } from '@/stores/decks'
import type { Card } from '@/types/deck'
import ManualEntryForm from '@/components/ManualEntryForm.vue'

const props = defineProps<{ id: string }>()
const store = useDecksStore()

const deck = computed(() => store.decks.find((d) => d.id === props.id))

const editingCard = ref<Card | null>(null)
const showForm = ref(false)

function openAddForm() {
  editingCard.value = null
  showForm.value = true
}

function openEditForm(card: Card) {
  editingCard.value = card
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingCard.value = null
}
</script>

<template>
  <div v-if="deck" class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">{{ deck.name }}</h1>
      <button
        v-if="!showForm"
        type="button"
        class="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        @click="openAddForm"
      >
        Add card
      </button>
    </div>

    <ManualEntryForm
      v-if="showForm"
      :deck-id="deck.id"
      :card="editingCard ?? undefined"
      @saved="closeForm"
      @cancel="closeForm"
    />

    <ul class="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
      <li
        v-for="card in deck.cards"
        :key="card.id"
        class="flex items-start justify-between gap-4 px-4 py-3"
      >
        <div>
          <p class="font-medium">{{ card.term }}</p>
          <p class="text-sm text-slate-600">{{ card.meaning }}</p>
          <p v-if="card.notes" class="mt-1 text-xs text-slate-400">{{ card.notes }}</p>
        </div>
        <button
          type="button"
          class="shrink-0 text-sm text-slate-500 hover:text-slate-900"
          @click="openEditForm(card)"
        >
          Edit
        </button>
      </li>
      <li v-if="deck.cards.length === 0" class="px-4 py-6 text-center text-sm text-slate-500">
        No cards yet.
      </li>
    </ul>
  </div>
  <p v-else class="text-slate-500">Deck not found.</p>
</template>
