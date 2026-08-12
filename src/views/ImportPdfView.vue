<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDecksStore } from '@/stores/decks'
import { extractVocabPairsFromPdf, type VocabPair } from '@/lib/pdfImport'
import ReviewImportTable from '@/components/ReviewImportTable.vue'

const props = defineProps<{ id: string }>()
const store = useDecksStore()
const router = useRouter()

type Status = 'idle' | 'loading' | 'review' | 'error'

const status = ref<Status>('idle')
const pairs = ref<VocabPair[]>([])
const errorMessage = ref('')

const validPairs = computed(() => pairs.value.filter((p) => p.term.trim() && p.meaning.trim()))

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  status.value = 'loading'
  errorMessage.value = ''
  try {
    pairs.value = await extractVocabPairsFromPdf(file)
    status.value = 'review'
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to parse PDF.'
    status.value = 'error'
  } finally {
    input.value = ''
  }
}

function reset() {
  status.value = 'idle'
  pairs.value = []
  errorMessage.value = ''
}

function commit() {
  if (validPairs.value.length === 0) return
  store.addCards(props.id, validPairs.value)
  router.push({ name: 'deck-detail', params: { id: props.id } })
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">Import from PDF</h1>

    <div v-if="status === 'idle' || status === 'error'" class="space-y-3">
      <input
        type="file"
        accept="application/pdf"
        class="block text-sm"
        @change="handleFileChange"
      />
      <p v-if="status === 'error'" class="text-sm text-red-600">{{ errorMessage }}</p>
    </div>

    <p v-else-if="status === 'loading'" class="text-sm text-slate-500">Parsing PDF…</p>

    <div v-else-if="status === 'review'" class="space-y-4">
      <ReviewImportTable v-model="pairs" />
      <div class="flex items-center justify-between">
        <button
          type="button"
          class="text-sm text-slate-500 hover:text-slate-900"
          @click="reset"
        >
          Choose a different file
        </button>
        <button
          type="button"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="validPairs.length === 0"
          @click="commit"
        >
          Add {{ validPairs.length }} card{{ validPairs.length === 1 ? '' : 's' }}
        </button>
      </div>
    </div>
  </div>
</template>
