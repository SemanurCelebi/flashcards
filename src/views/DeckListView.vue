<script setup lang="ts">
import { ref } from 'vue'
import { useDecksStore } from '@/stores/decks'
import { importDeckFile } from '@/lib/exportImport'
import DeckCard from '@/components/DeckCard.vue'

const store = useDecksStore()

const newDeckName = ref('')
const importError = ref('')

function handleCreate() {
  const name = newDeckName.value.trim()
  if (!name) return
  store.createDeck(name)
  newDeckName.value = ''
}

function handleDelete(deckId: string) {
  store.deleteDeck(deckId)
}

async function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  importError.value = ''
  try {
    const deck = await importDeckFile(file)
    store.importDeck(deck)
  } catch (err) {
    importError.value = err instanceof Error ? err.message : 'Failed to import deck.'
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Your decks</h1>
      <label
        class="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        Import backup (.json)
        <input type="file" accept="application/json" class="hidden" @change="handleImportFile" />
      </label>
    </div>

    <p v-if="importError" class="text-sm text-red-600">{{ importError }}</p>

    <form class="flex gap-2" @submit.prevent="handleCreate">
      <input
        v-model="newDeckName"
        type="text"
        placeholder="New deck name"
        class="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
      />
      <button
        type="submit"
        class="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
      >
        Create deck
      </button>
    </form>

    <div
      v-if="store.decks.length > 0"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
    >
      <DeckCard
        v-for="deck in store.decks"
        :key="deck.id"
        :deck="deck"
        @delete="handleDelete(deck.id)"
      />
    </div>
    <p v-else class="text-slate-500">No decks yet. Create one above or import a backup.</p>
  </div>
</template>
