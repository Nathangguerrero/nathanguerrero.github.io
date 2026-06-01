// Vite é usado apenas como dev server (`npm run dev`).
// O deploy NÃO usa o build do Vite — os arquivos .min.{css,js} são commitados
// e servidos diretamente pelo GitHub Pages. A config de `build` abaixo existe
// só para um eventual bundle local de inspeção.
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main:        resolve(__dirname, 'index.html'),
        stalo:       resolve(__dirname, 'pages/stalo.html'),
        hybridMedia: resolve(__dirname, 'pages/hybrid-media.html'),
        welcomeDay:  resolve(__dirname, 'pages/welcome-day.html'),
        acampaLkc:   resolve(__dirname, 'pages/acampa-lkc.html'),
        charlotte:   resolve(__dirname, 'pages/charlotte.html'),
        crecei:      resolve(__dirname, 'pages/crecei.html'),
        waveAgency:  resolve(__dirname, 'pages/wave-agency.html'),
      }
    }
  }
})
