const { createCanvas } = require('canvas')
const fs = require('fs')

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#0e0e10'
  ctx.fillRect(0, 0, size, size)

  // Rounded rect clip
  const radius = size * 0.2
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(size - radius, 0)
  ctx.quadraticCurveTo(size, 0, size, radius)
  ctx.lineTo(size, size - radius)
  ctx.quadraticCurveTo(size, size, size - radius, size)
  ctx.lineTo(radius, size)
  ctx.quadraticCurveTo(0, size, 0, size - radius)
  ctx.lineTo(0, radius)
  ctx.quadraticCurveTo(0, 0, radius, 0)
  ctx.closePath()
  ctx.clip()

  // Background fill
  ctx.fillStyle = '#0e0e10'
  ctx.fillRect(0, 0, size, size)

  // AF text
  ctx.fillStyle = '#3ecf8e'
  ctx.font = `bold ${size * 0.35}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('AF', size / 2, size / 2)

  fs.writeFileSync(filename, canvas.toBuffer('image/png'))
  console.log(`Generated ${filename}`)
}

generateIcon(192, 'public/icon-192.png')
generateIcon(512, 'public/icon-512.png')
