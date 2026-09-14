import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const assetsDirectory = path.resolve('dist/assets')
const files = (await readdir(assetsDirectory)).filter(file =>
  file.endsWith('.js')
)
const graph = new Map()

for (const file of files) {
  const source = await readFile(path.join(assetsDirectory, file), 'utf8')
  const imports = [
    ...source.matchAll(/(?:from|import)\(?["']\.\/(.+?\.js)["']/g),
  ].map(match => match[1])
  graph.set(
    file,
    imports.filter(dependency => files.includes(dependency))
  )
}

const visited = new Set()
const active = new Set()
const stack = []

function findCycle(file) {
  if (active.has(file)) {
    const cycleStart = stack.indexOf(file)
    return [...stack.slice(cycleStart), file]
  }
  if (visited.has(file)) return null

  visited.add(file)
  active.add(file)
  stack.push(file)

  for (const dependency of graph.get(file) ?? []) {
    const cycle = findCycle(dependency)
    if (cycle) return cycle
  }

  stack.pop()
  active.delete(file)
  return null
}

for (const file of files) {
  const cycle = findCycle(file)
  if (cycle) {
    console.error(`Circular production chunks: ${cycle.join(' -> ')}`)
    process.exit(1)
  }
}

console.log(
  `Production chunk graph is acyclic (${files.length} JavaScript files)`
)
