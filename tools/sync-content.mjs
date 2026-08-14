import { cp, mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = path.join(projectRoot, 'content')
const generatedPostsDir = path.join(projectRoot, 'source', '_posts')

if (!generatedPostsDir.startsWith(`${projectRoot}${path.sep}`)) {
  throw new Error('Refusing to write outside the project directory')
}

await rm(generatedPostsDir, { recursive: true, force: true })
await mkdir(generatedPostsDir, { recursive: true })

const entries = await readdir(contentDir, { withFileTypes: true })
const markdownFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))

for (const entry of markdownFiles) {
  await cp(path.join(contentDir, entry.name), path.join(generatedPostsDir, entry.name))
}

console.log(`Synced ${markdownFiles.length} Markdown file(s) into Hexo posts`)
