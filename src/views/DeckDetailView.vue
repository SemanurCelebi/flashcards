<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useDecksStore } from '@/stores/decks'
import { exportDeck } from '@/lib/exportImport'
import type { Card } from '@/types/deck'
import ManualEntryForm from '@/components/ManualEntryForm.vue'

const props = defineProps<{ id: string }>()
const store = useDecksStore()

const deck = computed(() => store.decks.find((d) => d.id === props.id))

const editingCard = ref<Card | null>(null)
const showForm = ref(false)

const renamingDeck = ref(false)
const deckNameDraft = ref('')

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

function removeCard(cardId: string) {
  if (!deck.value) return
  store.deleteCard(deck.value.id, cardId)
}

function startRename() {
  if (!deck.value) return
  deckNameDraft.value = deck.value.name
  renamingDeck.value = true
}

function saveRename() {
  if (!deck.value) return
  const name = deckNameDraft.value.trim()
  if (name) store.renameDeck(deck.value.id, name)
  renamingDeck.value = false
}

function cancelRename() {
  renamingDeck.value = false
}

function handleExport() {
  if (deck.value) exportDeck(deck.value)
}
</script>

<template>
  <div v-if="deck" class="space-y-6">
    <div>
      <form v-if="renamingDeck" class="flex items-center gap-2" @submit.prevent="saveRename">
        <input
          v-model="deckNameDraft"
          type="text"
          class="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xl font-semibold"
        />
        <button type="submit" class="text-sm text-slate-600 hover:text-slate-900">Save</button>
        <button
          type="button"
          class="text-sm text-slate-400 hover:text-slate-900"
          @click="cancelRename"
        >
          Cancel
        </button>
      </form>
      <div v-else class="flex items-center gap-2">
        <h1 class="text-2xl font-semibold">{{ deck.name }}</h1>
        <button
          type="button"
          class="text-sm text-slate-400 hover:text-slate-900"
          @click="startRename"
        >
          Rename
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <RouterLink
        :to="{ name: 'deck-study', params: { id: deck.id } }"
        class="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
      >
        Study
      </RouterLink>
      <button
        v-if="!showForm"
        type="button"
        class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        @click="openAddForm"
      >
        Add card
      </button>
      <RouterLink
        :to="{ name: 'deck-import', params: { id: deck.id } }"
        class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Import from PDF
      </RouterLink>
      <button
        type="button"
        class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        @click="handleExport"
      >
        Export deck
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
        <div class="flex shrink-0 gap-3">
          <button
            type="button"
            class="text-sm text-slate-500 hover:text-slate-900"
            @click="openEditForm(card)"
          >
            Edit
          </button>
          <button
            type="button"
            class="text-sm text-slate-400 hover:text-red-600"
            @click="removeCard(card.id)"
          >
            Delete
          </button>
        </div>
      </li>
      <li v-if="deck.cards.length === 0" class="px-4 py-6 text-center text-sm text-slate-500">
        No cards yet.
      </li>
    </ul>
  </div>
  <p v-else class="text-slate-500">Deck not found.</p>
</template>
