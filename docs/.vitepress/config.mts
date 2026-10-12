import { defineConfig } from 'vitepress'

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'eclipse-docs'
const defaultBase = repository.endsWith('.github.io') ? '/' : `/${repository}/`

const lessons = [
  { text: '00 Introduction', link: '/learn/introduction' },
  { text: '01 Avatars', link: '/learn/avatars' },
  { text: '02 Framework', link: '/learn/framework' },
  { text: '03 Schema', link: '/learn/schema' },
  { text: '04 Validation', link: '/learn/validation' },
  { text: '05 Welding', link: '/learn/welding' },
  { text: '06 Applying', link: '/learn/applying' },
  { text: '07 Scene', link: '/learn/scene' },
  { text: '08 Handles', link: '/learn/handles' },
  { text: '09 State', link: '/learn/state' },
  { text: '10 Interface', link: '/learn/interface' },
  { text: '11 Integration', link: '/learn/integration' },
  { text: '12 Buffer', link: '/learn/buffer' },
  { text: '13 Outfits', link: '/learn/outfits' },
  { text: '14 Importing', link: '/learn/importing' },
  { text: '15 Identity', link: '/learn/identity' },
  { text: '16 Lessons', link: '/learn/lessons' },
  { text: '17 Glossary', link: '/learn/glossary' },
]

export default defineConfig({
  title: 'Eclipse',
  description: 'An avatar customization library for Roblox R15 roleplay games, made by Polaris.',
  lang: 'en-US',
  base: process.env.DOCS_BASE_PATH || defaultBase,
  appearance: 'force-dark',
  cleanUrls: false,
  themeConfig: {
    siteTitle: 'ECLIPSE',
    nav: [
      { text: 'Getting started', link: '/start/installation' },
      { text: 'Guides', link: '/guides/configuration' },
      { text: 'API', link: '/api/server' },
      { text: 'How it works', link: '/learn/introduction' },
    ],
    sidebar: [
      {
        text: 'Getting started',
        items: [
          { text: 'Installation', link: '/start/installation' },
          { text: 'First integration', link: '/start/integration' },
        ],
      },
      {
        text: 'Guides',
        items: [
          { text: 'Configuration', link: '/guides/configuration' },
          { text: 'Interface', link: '/guides/interface' },
          { text: 'Outfits and imports', link: '/guides/outfits' },
          { text: 'Identity', link: '/guides/identity' },
        ],
      },
      {
        text: 'API',
        items: [
          { text: 'Server', link: '/api/server' },
          { text: 'Client and framework', link: '/api/client' },
        ],
      },
      { text: 'How it works', collapsed: true, items: lessons },
      {
        text: 'Reference',
        items: [
          { text: 'Formats and limits', link: '/reference/versions' },
          { text: 'Troubleshooting', link: '/reference/troubleshooting' },
          { text: 'Glossary', link: '/learn/glossary' },
          { text: 'License and credits', link: '/reference/license' },
          { text: 'Third-party notices', link: '/reference/third-party' },
        ],
      },
    ],
    search: { provider: 'local' },
    outline: { level: [2, 3] },
    editLink: {
      pattern: 'https://github.com/polarisdev-design/eclipse-docs/edit/main/docs/:path',
      text: 'Edit this page',
    },
    footer: {
      message: 'Eclipse by Polaris',
      copyright: 'Copyright © 2026 Polaris',
    },
  },
})
