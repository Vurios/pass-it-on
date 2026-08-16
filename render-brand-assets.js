import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const svgContent = fs.readFileSync('public/favicon.svg', 'utf-8')

function renderPNG(size, outputPath) {
  const resvg = new Resvg(svgContent, {
    fitTo: {
      mode: 'width',
      value: size,
    },
  })
  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()
  fs.writeFileSync(outputPath, pngBuffer)
  console.log(`Rendered ${outputPath} (${size}x${size})`)
}

renderPNG(16, 'public/favicon-16.png')
renderPNG(32, 'public/favicon-32.png')
renderPNG(180, 'public/apple-touch-icon.png')
renderPNG(512, 'public/brand/pass-it-on-512.png')
