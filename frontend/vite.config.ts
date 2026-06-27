import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs'
import * as path from 'path'

// Sync demo assets from conversation brain directory to public directory
try {
  const publicDir = path.join(__dirname, 'public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  const src1 = '/home/charogerboles/.gemini/antigravity/brain/44b14d08-e061-4fb2-b19c-91016892c507/olive_leaf_disease_1782595921121.png'
  const src2 = '/home/charogerboles/.gemini/antigravity/brain/44b14d08-e061-4fb2-b19c-91016892c507/wheat_leaf_rust_1782595932562.png'

  const dest1 = path.join(publicDir, 'olive_leaf_disease.png')
  const dest2 = path.join(publicDir, 'wheat_leaf_rust.png')

  if (fs.existsSync(src1)) {
    fs.copyFileSync(src1, dest1)
    console.log('Successfully copied olive leaf disease demo image to public folder.')
  }
  if (fs.existsSync(src2)) {
    fs.copyFileSync(src2, dest2)
    console.log('Successfully copied wheat leaf rust demo image to public folder.')
  }
} catch (e) {
  console.error('Failed to copy demo assets:', e)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

