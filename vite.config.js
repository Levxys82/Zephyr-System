import { defineConfig } from 'vite';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/';

export default defineConfig({
  base,
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
});
