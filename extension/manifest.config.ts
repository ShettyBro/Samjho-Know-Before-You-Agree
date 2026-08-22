import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Samjho — Know Before You Agree',
  version: '0.0.1',
  description: 'Understand consent agreements before you agree to them.',
  action: {
    default_title: 'Samjho',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
    },
  ],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  permissions: ['sidePanel', 'scripting'],
  host_permissions: ['http://localhost:4000/*'],
  optional_host_permissions: ['<all_urls>'],
})
