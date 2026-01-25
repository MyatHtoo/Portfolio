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

        // Copy .htaccess for proper MIME types on hosting
        try {
          copyFileSync('.htaccess', 'dist/.htaccess')
          console.log('✓ .htaccess copied to dist')
        } catch (err) {
          console.log('ℹ No .htaccess file found (optional)')
        }

        // Copy web.config for IIS/Azure hosting
        try {
          copyFileSync('web.config', 'dist/web.config')
          console.log('✓ web.config copied to dist')
        } catch (err) {
          console.log('ℹ No web.config file found (optional)')
        }

        // Copy _headers for Netlify hosting
        try {
          copyFileSync('_headers', 'dist/_headers')
          console.log('✓ _headers copied to dist')
        } catch (err) {
          console.log('ℹ No _headers file found (optional)')
        }

        // Copy vercel.json for Vercel hosting
        try {
          copyFileSync('vercel.json', 'dist/vercel.json')
          console.log('✓ vercel.json copied to dist')
        } catch (err) {
          console.log('ℹ No vercel.json file found (optional)')
        }

        // Copy Edu folder if exists
        try {
          cpSync('Edu', 'dist/Edu', { recursive: true })
          console.log('✓ Edu folder copied to dist')
        } catch (err) {
          // Folder might not exist
        }

        // Copy achievements folder if exists
        try {
          cpSync('achievements', 'dist/achievements', { recursive: true })
          console.log('✓ Achievements folder copied to dist')
        } catch (err) {
          // Folder might not exist
        }
      }
    }
  ],
})
