import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
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

function normalizeDateOnlyFields(markdown) {
  if (!markdown.startsWith('---\n')) return markdown

  const frontMatterEnd = markdown.indexOf('\n---', 4)
  if (frontMatterEnd === -1) return markdown

  // Hexo interprets this in the configured site timezone. Noon keeps date-based
  // permalinks stable even when the build host itself runs in UTC.
  const frontMatter = markdown.slice(0, frontMatterEnd).replace(
    /^((?:date|updated):\s*)(["']?)(\d{4}-\d{2}-\d{2})\2\s*$/gm,
    '$1"$3 12:00:00"',
  )

  return frontMatter + markdown.slice(frontMatterEnd)
}

for (const entry of markdownFiles) {
  const source = await readFile(path.join(contentDir, entry.name), 'utf8')
  const normalized = normalizeDateOnlyFields(source)
  await writeFile(path.join(generatedPostsDir, entry.name), normalized)
}

console.log(`Synced ${markdownFiles.length} Markdown file(s) into Hexo posts`)
