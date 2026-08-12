<script setup lang="ts">
import type { VocabPair } from '@/lib/pdfImport'

const pairs = defineModel<VocabPair[]>({ required: true })

function updateField(index: number, field: 'term' | 'meaning', value: string) {
  const row = pairs.value[index]
  if (!row) return
  row[field] = value
}

function removeRow(index: number) {
  pairs.value = pairs.value.filter((_, i) => i !== index)
}

function addRow() {
  pairs.value = [...pairs.value, { term: '', meaning: '' }]
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-600">{{ pairs.length }} row{{ pairs.length === 1 ? '' : 's' }}</p>
      <button
        type="button"
        class="text-sm font-medium text-slate-600 hover:text-slate-900"
        @click="addRow"
      >
        + Add row
      </button>
    </div>

    <table class="w-full border-collapse overflow-hidden rounded-md border border-slate-200 bg-white text-sm">
      <thead>
        <tr class="border-b border-slate-200 bg-slate-50 text-left">
          <th class="px-3 py-2 font-medium text-slate-600">Term</th>
          <th class="px-3 py-2 font-medium text-slate-600">Meaning</th>
          <th class="w-16 px-3 py-2"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(pair, index) in pairs"
          :key="index"
          class="border-b border-slate-100 last:border-b-0"
        >
          <td class="px-1 py-1">
            <input
              :value="pair.term"
              type="text"
              class="w-full rounded border border-transparent px-2 py-1.5 hover:border-slate-300 focus:border-slate-400 focus:outline-none"
              @input="updateField(index, 'term', ($event.target as HTMLInputElement).value)"
            />
          </td>
          <td class="px-1 py-1">
            <input
              :value="pair.meaning"
              type="text"
              class="w-full rounded border border-transparent px-2 py-1.5 hover:border-slate-300 focus:border-slate-400 focus:outline-none"
              @input="updateField(index, 'meaning', ($event.target as HTMLInputElement).value)"
            />
          </td>
          <td class="px-3 py-1.5 text-right">
            <button
              type="button"
              class="text-xs text-slate-400 hover:text-red-600"
              @click="removeRow(index)"
            >
              Remove
            </button>
          </td>
        </tr>
        <tr v-if="pairs.length === 0">
          <td colspan="3" class="px-3 py-6 text-center text-slate-500">No rows yet.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
