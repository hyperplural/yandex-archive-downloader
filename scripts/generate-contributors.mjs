import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const outFile = resolve(root, 'CONTRIBUTORS.md');

function getContributors() {
  try {
    const out = execSync('git shortlog -sne HEAD', { encoding: 'utf8' }).trim();
    if (!out) return [];

    return out
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^(\d+)\s+(.+?)\s+<(.+)>$/);
        if (!match) return null;
        return {
          commits: Number(match[1]),
          name: match[2],
          email: match[3]
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

const contributors = getContributors();

let content = '# Контрибьюторы\n\n';
if (contributors.length === 0) {
  content += 'Пока нет коммитов в истории репозитория.\n';
} else {
  content += contributors
    .map((c, index) => `${index + 1}. ${c.name} <${c.email}> — ${c.commits} коммит(ов)`)
    .join('\n');
  content += '\n';
}

writeFileSync(outFile, content, 'utf8');
console.log(`Generated ${outFile}`);
