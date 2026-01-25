import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, readdirSync, cpSync } from 'fs'
import { join } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-assets',
      closeBundle() {
        // Copy Profiles folder
        const profilesDir = 'Profiles'
        const outProfilesDir = 'dist/Profiles'
        try {
          mkdirSync(outProfilesDir, { recursive: true })
          const files = readdirSync(profilesDir)
          files.forEach(file => {
            copyFileSync(join(profilesDir, file), join(outProfilesDir, file))
          })
          console.log('✓ Profiles folder copied to dist')
        } catch (err) {
          console.error('Error copying Profiles folder:', err)
        }

        // Copy assets folder (js files, etc)
        try {
          cpSync('assets', 'dist/assets', { recursive: true })
          console.log('✓ Assets folder copied to dist')
        } catch (err) {
          console.error('Error copying assets folder:', err)
        }

        // Copy skills.json
        try {
          copyFileSync('skills.json', 'dist/skills.json')
          console.log('✓ skills.json copied to dist')
        } catch (err) {
          console.error('Error copying skills.json:', err)
        }

        // Copy certificates folder if exists
        try {
          cpSync('certificates', 'dist/certificates', { recursive: true })
          console.log('✓ Certificates folder copied to dist')
        } catch (err) {
          // Folder might not exist, that's ok
        }
      }
    }
  ],
})
