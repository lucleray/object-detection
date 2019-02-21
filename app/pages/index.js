import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Viewer from '../components/Viewer'
import Dropzone from '../components/Dropzone'

const API_URL = process.env.API_URL

async function fetchPredict(file, setObjects, setStatus) {
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

async function fetchWarm() {
  await fetch(`${API_URL}/warm`)
}

export default () => {
  const [file, setFile] = useState()
  const [status, setStatus] = useState('waiting')
  const [objects, setObjects] = useState([])

  useEffect(() => {
    fetchWarm()
  }, [])

  return (
    <>
      <Layout
        sidebar={
          <>
            <h1>Object Detection</h1>
            <Dropzone
              setStatus={setStatus}
              setFile={setFile}
              setObjects={setObjects}
              fetchPredict={fetchPredict}
            />
          </>
        }
      >
        <Viewer file={file} objects={objects} status={status} />
      </Layout>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
        }
        h1 {
          margin-bottom: 1em;
        }
      `}</style>
    </>
  )
}
