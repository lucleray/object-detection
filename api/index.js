const loadTf = require('tfjs-lambda')
const contentType = require('content-type')
const { send, buffer } = require('micro')
const cors = require('micro-cors')()
const Jimp = require('jimp')

const CLASSES = require('./lib/classes')
const { BadRequestError, handleError } = require('./lib/error')

const TF_MODEL_URL = process.env.TF_MODEL_URL

const CONTENT_TYPES_IMAGE = ['image/jpeg', 'image/png']

let tfModelCache

async function loadModel() {
  try {
    const tf = await loadTf()

    if (tfModelCache) {
      return tfModelCache
    }

    tfModelCache = await tf.loadGraphModel(`${TF_MODEL_URL}/model.json`)
    return tfModelCache
  } catch (err) {
    console.log(err)
    throw BadRequestError('The model could not be loaded')
  }
}

async function imgToTensor(imgBuffer) {
  const tf = await loadTf()

  const image = await Jimp.read(imgBuffer)
  const { width, height, data } = image.bitmap

  const numPixels = width * height
  const values = new Int32Array(numPixels * 3)

  for (let i = 0; i < numPixels; i++) {
    for (let c = 0; c < 3; c++) {
      values[i * 3 + c] = data[i * 4 + c]
    }
  }

  const tensor = await tf.tidy(() => tf.tensor3d(values, [height, width, 3]))

  return { tensor, width, height }
}

async function predict(tfModel, tensor) {
  const tf = await loadTf()

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

async function tensorsToBBoxes({ scores, boxes, width, height }) {
  const tf = await loadTf()

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

  return bboxes
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
      const { type: mimeType } = contentType.parse(req)

      if (CONTENT_TYPES_IMAGE.includes(mimeType)) {
        const tf = await loadTf()
        const tfModel = await loadModel()
        
        const buf = await buffer(req, { limit: '5mb' })
        const { tensor, width, height } = await imgToTensor(buf)

        const { scores, boxes } = await predict(tfModel, tensor)

        const bboxes = await tensorsToBBoxes({ scores, boxes, width, height })

        return send(res, 200, bboxes)
      }

      throw BadRequestError('Only images are supported at the moment')
    }

    return send(res, 404)
  })
)
