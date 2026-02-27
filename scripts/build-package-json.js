const fs = require("fs")
const path = require("path")

const rootDir = path.resolve(__dirname, "..")
const distDir = path.join(rootDir, "dist")

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

const pkg = JSON.parse(
  fs.readFileSync(path.join(rootDir, "package.json"), "utf8")
)

const minimal = {
  name: pkg.name,
  version: pkg.version,
  author: pkg.author,
  license: pkg.license,
  main: pkg.main,
  types: pkg.types,
  homepage: pkg.homepage,
  bugs: pkg.bugs,
  keywords: pkg.keywords,
  peerDependencies: pkg.peerDependencies,
  dependencies: pkg.dependencies,
}

if (!minimal.dependencies || Object.keys(minimal.dependencies).length === 0) {
  delete minimal.dependencies
}

fs.writeFileSync(
  path.join(distDir, "package.json"),
  JSON.stringify(minimal, null, 2) + "\n",
  "utf8"
)
