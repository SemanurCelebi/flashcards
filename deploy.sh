#!/usr/bin/env sh

# Manual fallback deploy — the GitHub Actions workflow (.github/workflows/deploy.yml)
# handles this automatically on every push to main. Use this only for one-off/emergency deploys.

set -e

npm run build
cp dist/index.html dist/404.html

cd dist
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:SemanurCelebi/flashcards.git main:gh-pages
cd -
