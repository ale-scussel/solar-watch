<template>
  <component :is="chartComponent" :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed } from 'vue'
import { Line, Bar, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  LineElement, BarElement, ArcElement,
  CategoryScale, LinearScale, PointElement,
  Filler
} from 'chart.js'

ChartJS.register(
  Title, Tooltip, Legend,
  LineElement, BarElement, ArcElement,
  CategoryScale, LinearScale, PointElement,
  Filler
)

const props = defineProps({
  records: { type: Array, required: true },
  type: { type: String, default: 'line' }  // 'line' | 'bar' | 'pie'
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const PALETTE = [
  '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
  '#06b6d4', '#84cc16', '#d946ef', '#fb923c', '#22c55e',
  '#a855f7', '#e11d48', '#0284c7', '#65a30d', '#dc2626',
  '#7c3aed', '#059669', '#b45309', '#1d4ed8', '#be123c'
]

function paletteColors(n) {
  return Array.from({ length: n }, (_, i) => PALETTE[i % PALETTE.length])
}

// ── Derived data ──────────────────────────────────────────────────────────────
const chartComponent = computed(() => {
  if (props.type === 'bar') return Bar
  if (props.type === 'pie') return Pie
  return Line
})

const labels = computed(() =>
  props.records.map(d =>
    new Date(d.date).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' })
  )
)

const productionValues = computed(() =>
  props.records.map(d => +d.production.toFixed(2))
)

const chartData = computed(() => {
  if (props.type === 'pie') {
    return {
      labels: labels.value,
      datasets: [{
        label: 'Produzione (kW)',
        data: productionValues.value,
        backgroundColor: paletteColors(props.records.length),
        borderWidth: 1,
        hoverOffset: 8
      }]
    }
  }
  return {
    labels: labels.value,
    datasets: [{
      label: 'Produzione (kW)',
      data: productionValues.value,
      borderColor: '#4f46e5',
      backgroundColor: props.type === 'bar'
        ? 'rgba(79, 70, 229, 0.75)'
        : 'rgba(79, 70, 229, 0.08)',
      fill: props.type === 'line',
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 5,
      borderWidth: 2
    }]
  }
})

const chartOptions = computed(() => {
  if (props.type === 'pie') {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, font: { size: 11 }, padding: 10 }
        },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(2)} kW` }
        }
      }
    }
  }
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: ctx => ` ${ctx.parsed.y.toFixed(2)} kW` }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, maxRotation: 45, minRotation: 0 }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 11 },
          callback: v => `${v} kW`
        },
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    }
  }
})
</script>
