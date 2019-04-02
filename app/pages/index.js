import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Viewer from '../components/Viewer'
import Dropzone from '../components/Dropzone'
import Head from 'next/head'

const API_URL = process.env.API_URL

async function fetchPredict(file, setObjects, setStatus) {
  setStatus('loading')
  window.scrollTo(0, 0)
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

function shuffle(a) {
  var j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}

const ExampleImage = ({
  src,
  setStatus,
  setFile,
  setObjects,
  fetchPredict
}) => {
  const [img, setImg] = useState()

  useEffect(() => {
    fetch(src)
      .then(res => res.blob())
      .then(blob => {
        blob.src = URL.createObjectURL(blob)
        setImg(blob)
      })
  }, [])

  return (
    <div className="sample-img">
      {img ? (
        <div className="img-frame show">
          <img
            src={img.src}
            onClick={() => {
              setFile(img)
              fetchPredict(img, setObjects, setStatus)
            }}
          />
        </div>
      ) : (
        <div className="img-frame" />
      )}
      <style jsx>{`
        .sample-img {
          position: relative;
          width: 190px;
          height: 190px;
          float: left;
        }
        .img-frame {
          margin-right: 10px;
          margin-bottom: 15px;
          padding: 12px;
          border-radius: 5px;
          border: 1px solid #ddd;
          box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.1);
          opacity: 0;
          transition: 0.7s ease-in;
        }
        .img-frame.show {
          opacity: 1;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
      `}</style>
    </div>
  )
}

const topics = [
  'cat',
  'banana',
  'plane',
  'guitar',
  'bird',
  'car',
  'bus',
  'horse',
  'surfboard',
  'wine',
  'pizza',
  'chair'
]

shuffle(topics)

const Examples = props => {
  return (
    <div>
      {topics.slice(0, 6).map(topic => (
        <ExampleImage
          key={topic}
          src={`https://source.unsplash.com/500x500/?${topic}`}
          {...props}
        />
      ))}
      <div className="float-reset" />
      <style jsx>{`
        div {
          margin-bottom: 2em;
        }
        .float-reset {
          clear: both;
        }
      `}</style>
    </div>
  )
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
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Layout
        sidebar={
          <>
            <h1>Object-Detection</h1>

            <h2>Upload an image</h2>
            <Dropzone
              setStatus={setStatus}
              setFile={setFile}
              setObjects={setObjects}
              fetchPredict={fetchPredict}
            />

            <h2>Or choose an example image</h2>
            <Examples
              setFile={setFile}
              setStatus={setStatus}
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
          font-weight: bold;
          font-size: 1.3em;
          padding-bottom: 0.8em;
          color: #555;
          border-bottom: 1px solid #eee;
        }
        h2 {
          margin-bottom: 1em;
          font-weight: bold;
          font-size: 1.3em;
        }
      `}</style>
    </>
  )
}
