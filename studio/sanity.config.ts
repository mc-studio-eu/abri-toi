import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes, SINGLETONS } from './schemaTypes'
import { structure } from './structure'

export default defineConfig({
  name: 'abri-toi',
  title: 'Abri Toi',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'a-remplacer',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    // Pas de « Créer » pour les pages uniques, les gammes ni les pages légales
    templates: (templates) => templates.filter((t) => !SINGLETONS.includes(t.schemaType) && !['gamme', 'pageLegale'].includes(t.schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      SINGLETONS.includes(schemaType) || ['gamme', 'pageLegale'].includes(schemaType)
        ? actions.filter((a) => !['duplicate', 'delete', 'unpublish'].includes(a.action ?? ''))
        : actions,
  },
})
