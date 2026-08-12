<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useDecksStore } from '@/stores/decks'
import { buildStudyQueue } from '@/lib/srs'
import type { Card } from '@/types/deck'
import FlashCard from '@/components/FlashCard.vue'

const props = defineProps<{ id: string }>()
const store = useDecksStore()

const deck = computed(() => store.decks.find((d) => d.id === props.id))

const queue = ref<Card[]>([])
const knownCount = ref(0)
const learningCount = ref(0)
const complete = ref(false)

const currentCard = computed(() => queue.value[0] ?? null)

function startSession() {
  if (!deck.value) return
  queue.value = buildStudyQueue(deck.value.cards)
  knownCount.value = 0
  learningCount.value = 0
  complete.value = queue.value.length === 0
}

onMounted(startSession)

function handleKnown() {
  if (!deck.value || !currentCard.value) return
  store.markCardKnown(deck.value.id, currentCard.value.id)
  knownCount.value++
  advance()
}

function handleLearning() {
  if (!deck.value || !currentCard.value) return
  store.markCardLearning(deck.value.id, currentCard.value.id)
  learningCount.value++
  advance()
}

function advance() {
  queue.value = queue.value.slice(1)
  if (queue.value.length === 0) complete.value = true
}
</script>

<template>
  <div v-if="deck" class="space-y-6">
    <h1 class="text-2xl font-semibold">Study: {{ deck.name }}</h1>

    <div v-if="!complete && currentCard" class="space-y-4">
      <p class="text-sm text-slate-500">
        {{ queue.length }} card{{ queue.length === 1 ? '' : 's' }} left
      </p>
      <FlashCard :card="currentCard" />
      <div class="flex justify-center gap-3">
        <button
          type="button"
          class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          @click="handleLearning"
        >
          Still learning
        </button>
        <button
          type="button"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          @click="handleKnown"
        >
          Know it
        </button>
      </div>
    </div>

    <div v-else class="space-y-4 text-center">
      <p v-if="deck.cards.length === 0" class="text-slate-500">This deck has no cards yet.</p>
      <template v-else>
        <p class="text-lg font-medium">Session complete</p>
        <p class="text-sm text-slate-600">
          {{ knownCount }} known · {{ learningCount }} still learning
        </p>
      </template>
      <div class="flex justify-center gap-3">
        <button
          v-if="deck.cards.length > 0"
          type="button"
          class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          @click="startSession"
        >
          Study again
        </button>
        <RouterLink
          :to="{ name: 'deck-detail', params: { id: deck.id } }"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Back to deck
        </RouterLink>
      </div>
    </div>
  </div>
  <p v-else class="text-slate-500">Deck not found.</p>
</template>
