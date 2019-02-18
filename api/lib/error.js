const { send } = require('micro')

class ClientError extends Error {
  constructor(statusCode, error) {
    super(`${error.message} (${error.code})`)
    this.statusCode = statusCode
    this.error = error
  }

  send(res) {
    send(res, this.statusCode, { error: this.error })
  }
}

/**
 * @param {number} statusCode
 * @param {{ code: string, message: string, [detail: string]: any }} error
 */
const createError = (statusCode, error, details) => {
  // legacy createError
  if (typeof error === 'string') {
    return new ClientError(statusCode, { message: error, details })
  }

  return new ClientError(statusCode, error)
}

const InternalServerError = () =>
  createError(500, {
    code: 'internal_server_error',
    message: 'An unexpected internal server error occurred'
  })

const NotAuthorizedError = () =>
  createError(401, {
    code: 'not_authorized',
    message: 'Not authorized'
  })

const BadRequestError = (message = 'Request is malformed') =>
  createError(400, {
    code: 'bad_request',
    message
  })

const handleError = fn => async (req, res, opts) => {
  try {
    return await fn(req, res, opts)
  } catch (error) {
    // eslint-disable-next-line
    console.error(error)

    if (error instanceof ClientError) {
      error.send(res)
    } else {
      InternalServerError().send(res)
    }
  }
}

module.exports = {
  handleError,
  createError,
  InternalServerError,
  NotAuthorizedError,
  BadRequestError
}
