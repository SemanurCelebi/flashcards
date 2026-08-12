<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDecksStore } from '@/stores/decks'
import type { Card } from '@/types/deck'

const props = defineProps<{ deckId: string; card?: Card }>()
const emit = defineEmits<{ saved: [card: Card]; cancel: [] }>()

const store = useDecksStore()

const term = ref(props.card?.term ?? '')
const meaning = ref(props.card?.meaning ?? '')
const notes = ref(props.card?.notes ?? '')

watch(
  () => props.card,
  (card) => {
    term.value = card?.term ?? ''
    meaning.value = card?.meaning ?? ''
    notes.value = card?.notes ?? ''
  },
)

function handleSubmit() {
  const trimmedTerm = term.value.trim()
  const trimmedMeaning = meaning.value.trim()
  if (!trimmedTerm || !trimmedMeaning) return

  const trimmedNotes = notes.value.trim() || undefined
  const saved = props.card
    ? store.updateCard(props.deckId, props.card.id, trimmedTerm, trimmedMeaning, trimmedNotes)
    : store.addCard(props.deckId, trimmedTerm, trimmedMeaning, trimmedNotes)

  if (saved) emit('saved', saved)
}
</script>

<template>
  <form
    class="space-y-3 rounded-md border border-slate-200 bg-white p-4"
    @submit.prevent="handleSubmit"
  >
    <div>
      <label class="block text-sm font-medium text-slate-700" for="card-term">Term</label>
      <input
        id="card-term"
        v-model="term"
        type="text"
        required
        class="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700" for="card-meaning">Meaning</label>
      <textarea
        id="card-meaning"
        v-model="meaning"
        required
        rows="2"
        class="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700" for="card-notes"
        >Notes (optional)</label
      >
      <textarea
        id="card-notes"
        v-model="notes"
        rows="2"
        class="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
      />
    </div>
    <div class="flex justify-end gap-2">
      <button
        type="button"
        class="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
      >
        {{ props.card ? 'Save' : 'Add card' }}
      </button>
    </div>
  </form>
</template>
