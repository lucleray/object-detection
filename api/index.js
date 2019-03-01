const { createCanvas, Image } = require('canvas')
const contentType = require('content-type')
const { send, buffer } = require('micro')
const cors = require('micro-cors')()

const tar = require('tar')
const zlib = require('zlib')
const http = require('http')
const { promisify } = require('util')
const mkdir = promisify(require('fs').mkdir)

const CLASSES = require('./lib/classes')
const { BadRequestError, handleError } = require('./lib/error')

const TF_MODEL_URL = process.env.TF_MODEL_URL

const CONTENT_TYPES_IMAGE = ['image/jpeg', 'image/png']

let tf

async function loadTf() {
  if (tf) return

  try {
    await mkdir('tfjs-node', { recursive: true })

    // download/unzip tfjs-node
    await new Promise((resolve, reject) => {
      const x = tar.x({ cwd: 'node_modules/tfjs-node' })

      x.on('end', () => {
        tf = require('tfjs-node')
        tf.disableDeprecationWarnings()
        resolve()
      })

      x.on('error', error => {
        reject(error)
      })

      http.get('/build-tfjs/tfjs-node.tar.gz', res => {
        res.pipe(zlib.Unzip()).pipe(x)
      })
    })
  } catch (err) {
    console.log(err)
    throw BadRequestError('Tensorflow not be loaded')
  }
}

let tfModelCache

async function loadModel() {
  if (tfModelCache) {
    return tfModelCache
  }

  try {
    tfModelCache = await tf.loadFrozenModel(
      `${TF_MODEL_URL}/tensorflowjs_model.pb`,
      `${TF_MODEL_URL}/weights_manifest.json`
    )
    return tfModelCache
  } catch (err) {
    console.log(err)
    throw BadRequestError('The model could not be loaded')
  }
}

async function imgToTensor(imgBuffer) {
  const img = new Image()
  const imgOnLoad = new Promise(resolve => {
    img.onload = resolve
  })
  img.src = imgBuffer

  await imgOnLoad
  const width = img.width
  const height = img.height

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)

  const tensor = await tf.tidy(() => tf.fromPixels(canvas))

  return { tensor, width, height }
}

async function predict(tfModel, tensor) {
  const batched = await tf.tidy(() => tensor.expandDims())
  const result = await tfModel.executeAsync(batched)
  const scores = result[0].arraySync()[0]
  const boxes = result[1].dataSync()

  batched.dispose()
  tf.dispose(result)

  return { scores, boxes }
}

function findMax(array) {
  return array.reduce((max, item, index) => {
    if (max.item === undefined || item > max.item) {
      return { item, index }
    }
    return max
  }, {})
}

module.exports = cors(
  handleError(async (req, res) => {
    if (req.method === 'OPTIONS') {
      return send(res, 200)
    }

    if (req.url === '/api/warm') {
      await loadTf()
      await loadModel()
      return send(res, 200)
    }

    if (req.url === '/api/predict') {
      await loadModel()
      const tfModel = await loadModel()

      const { type: mimeType } = contentType.parse(req)

      if (CONTENT_TYPES_IMAGE.includes(mimeType)) {
        const buf = await buffer(req, { limit: '5mb' })
        const { tensor, width, height } = await imgToTensor(buf)

        const { scores, boxes } = await predict(tfModel, tensor)

        const maxScores = scores.map(findMax)

        const indexTensor = tf.tidy(() => {
          const boxes2 = tf.tensor2d(boxes, [1917, 4])
          return tf.image.nonMaxSuppression(
            boxes2,
            maxScores.map(x => x.item),
            20,
            0.5,
            0.5
          )
        })

        const indexes = indexTensor.arraySync()
        indexTensor.dispose()

        const bboxes = indexes.map(index => {
          return {
            bbox: [
              { x: boxes[index * 4 + 1] * width, y: boxes[index * 4] * height },
              {
                x: boxes[index * 4 + 3] * width,
                y: boxes[index * 4 + 2] * height
              }
            ],
            score: maxScores[index].item,
            class: CLASSES[maxScores[index].index + 1].displayName
          }
        })

        return send(res, 200, bboxes)
      }

      throw BadRequestError('Only images are supported at the moment')
    }

    return send(res, 404)
  })
)
