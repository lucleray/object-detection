import React, { useState } from 'react'
import Dropzone from 'react-dropzone'

const API_URL = process.env.API_URL

const scaleView = (
  { naturalWidth, naturalHeight, width, height },
  setScale
) => {
  if (naturalWidth > naturalHeight) {
    setScale(width / naturalWidth)
  } else {
    setScale(height / naturalHeight)
  }
}

const Viewer = ({ file, objects }) => {
  const [scale, setScale] = useState()

  return (
    <div>
      <img onLoad={e => scaleView(e.target, setScale)} src={file.src} />
      {scale && (
        <svg>
          <g
            style={{
              transform: `scale(${scale})`
            }}
          >
            {objects.map(obj => {
              const [{ x, y }, { x: x1, y: y1 }] = obj.bbox
              return (
                <rect
                  x={x}
                  y={y}
                  width={x1 - x}
                  height={y1 - y}
                  stroke="blue"
                  fill="none"
                  strokeWidth={2 / scale}
                />
              )
            })}
          </g>
        </svg>
      )}
      <style jsx>{`
        div {
          position: relative;
        }
        img,
        svg {
          position: absolute;
          top: 0;
          left: 0;
        }
        img {
          max-width: 100%;
          max-height: 100%;
        }
        svg,
        div {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  )
}

async function fetchAPI(file, setObjects, setStatus) {
  setStatus('loading')
  setObjects([])
  const res = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    body: file
  })
  if (!res.ok) {
    setStatus('error')
    return
  }
  const json = await res.json()
  setObjects(json)
  setStatus('success')
}

export default () => {
  const [file, setFile] = useState()
  const [status, setStatus] = useState('waiting')
  const [objects, setObjects] = useState([])

  return (
    <div>
      <Dropzone
        accept="image/jpeg,image/png"
        maxSize={5 * 1024 * 1024}
        multiple={false}
        onDrop={(acceptedFiles, rejectedFiles) => {
          if (acceptedFiles.length !== 1 || rejectedFiles.length > 0) {
            setStatus('error')
          } else {
            const file = acceptedFiles[0]
            file.src = URL.createObjectURL(file)
            setFile(file)
            fetchAPI(file, setObjects, setStatus)
          }
        }}
      >
        {({ getRootProps, getInputProps }) => {
          return (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drop file here...</p>
            </div>
          )
        }}
      </Dropzone>
      <div style={{ width: '500px', height: '500px' }}>
        {file && <Viewer file={file} objects={objects} />}
      </div>
      <div>Status : {status}</div>
    </div>
  )
}
