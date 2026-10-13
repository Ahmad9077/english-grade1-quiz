// Turns the preview build into a page for a private claude.ai preview link:
// the viewer supplies the document shell, so the page carries only its own head
// tags and body. Google Fonts is linked because the viewer allows that host for fonts.
import fs from 'node:fs'

const html = fs.readFileSync('dist/index.html', 'utf8')
const script = html.match(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"/)?.[1]
const style = html.match(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"/)?.[1]
if (!script || !style) throw new Error('Could not find the built script and stylesheet in dist/index.html.')

const page = `<title>English</title>
<meta name="description" content="نسخة تجريبية لتدريب الصف الأول على الاختبار القصير ١ في الإنجليزي.">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Baloo+Bhaijaan+2:wght@400..800&family=Lalezar&display=swap">
<link rel="stylesheet" href="${style}">
<div id="root"></div>
<script type="module" src="${script}"></script>
`
fs.writeFileSync('dist/page.html', page)
const files = []
const walk = (dir) => {
  for (const entry of fs.readdirSync(`dist/${dir}`, { withFileTypes: true })) {
    const path = dir ? `${dir}/${entry.name}` : entry.name
    if (entry.isDirectory()) walk(path)
    else if (!['index.html', 'page.html', 'files.json'].includes(path) && !path.endsWith('.map')) files.push({ path })
  }
}
walk('')
fs.writeFileSync('dist/files.json', JSON.stringify(files))
console.log(`page.html → ${script}, ${style}; ${files.length} supporting files`)
