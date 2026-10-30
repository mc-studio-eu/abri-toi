import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  studioHost: 'abri-toi',
  deployment: { appId: 'd8n6ntwrq3cu7mnuippvosg7', autoUpdates: true },
})
