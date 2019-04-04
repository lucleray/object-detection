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

function shuffle(arr) {
  const a = [...arr]
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
  topic,
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
            alt={`A ${topic}`}
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
          cursor: pointer;
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

const TOPICS = [
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
  'chair',
  'traffic light',
  'boat',
  'bench',
  'bear',
  'elephant',
  'skateboard',
  'sandwich',
  'apple',
  'hot dog',
  'donut',
  'oven',
  'clock',
  'teddy bear',
  'toothbrush',
  'suit case'
]

const Examples = ({ topics, ...props }) => {
  return (
    <div>
      {topics.slice(0, 6).map(topic => (
        <ExampleImage
          key={topic}
          src={`https://source.unsplash.com/500x500/?${topic}`}
          topic={topic}
          {...props}
        />
      ))}
      <div className="float-reset" />
      <style jsx>{`
        .float-reset {
          clear: both;
          margin-bottom: 2em;
        }
      `}</style>
    </div>
  )
}

const APIUsage = () => {
  return (
    <pre>
      <code>{`curl -X POST https://object-detection.now.sh/api/predict \\
  -H 'content-type: image/jpeg' \\
  --data-binary "@my_image.jpeg"`}</code>
      <style jsx>{`
        pre {
          color: rgb(214, 222, 235);
          line-height: 1.45;
          font-size: 1.1em;
          font-family: Hack, monospace;
          background: rgb(1, 22, 39);
          padding: 16px;
          overflow: auto;
          border-radius: 3px;
          margin-bottom: 2em;
        }
      `}</style>
    </pre>
  )
}

export default () => {
  const [file, setFile] = useState()
  const [status, setStatus] = useState('waiting')
  const [error, setError] = useState(null)
  const [objects, setObjects] = useState([])
  const [topics, setTopics] = useState(shuffle(TOPICS))

  useEffect(() => {
    fetchWarm()
  }, [])

  return (
    <>
      <Head>
        <title>Object Detection - An API to detect objects on images</title>
        <meta
          name="description"
          content="An API to detect objects on images using tensorflow-js and Zeit Now"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Layout
        sidebar={
          <>
            {status === 'error' && (
              <div className="alert-red">
                <div className="alert-content">
                  {error || 'The API returned an error'}
                </div>
              </div>
            )}
            {status === 'success' && objects.length === 0 && (
              <div className="alert-orange">
                <div className="alert-content">
                  No objects detected on this image
                </div>
              </div>
            )}
            <div className="padding">
              <h1>Object-Detection</h1>

              <h2>Upload an image</h2>
              <Dropzone
                setStatus={setStatus}
                setFile={setFile}
                setObjects={setObjects}
                fetchPredict={fetchPredict}
                setError={setError}
              />

              <h2>
                Or choose an example image (
                <button
                  className="link"
                  onClick={() => setTopics(shuffle(TOPICS))}
                >
                  refresh?
                </button>
                )
              </h2>
              <Examples
                topics={topics}
                setFile={setFile}
                setStatus={setStatus}
                setObjects={setObjects}
                fetchPredict={fetchPredict}
              />

              <h2>API Usage</h2>
              <APIUsage />

              <h2>How does it work?</h2>

              <p className="mb">
                You can read more on{' '}
                <a href="https://zeit.co/blog/serverless-machine-learning">
                  the dedicated article on ZEIT's blog
                </a>{' '}
                or in the code{' '}
                <a href="https://github.com/lucleray/object-detection">
                  available on Github.
                </a>
              </p>

              <p className="mb">
                Made by{' '}
                <a
                  href="https://twitter.com/lucleray"
                  target="_blank"
                  rel="noreferrer"
                >
                  @lucleray
                </a>
                .
              </p>
            </div>
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
        .alert-orange {
          background: rgba(255, 127, 80, 1);
          color: white;
        }
        .alert-red {
          background: rgba(255, 0, 0, 0.8);
          color: white;
        }
        .alert-content {
          padding: 10px 25px 15px 25px;
          text-align: center;
          font-weight: bold;
        }
        .padding {
          padding: 30px 40px;
        }
        button.link,
        a {
          color: rgb(32, 89, 246);
          border-bottom: 1px solid rgba(32, 89, 246, 0.9);
          border-top: 0;
          border-left: 0;
          border-right: 0;
          text-decoration: none;
          font-size: inherit;
          font-weight: inherit;
          cursor: pointer;
        }
        p {
          line-height: 1.5em;
          font-size: 1.1em;
        }
        p.mb {
          margin-bottom: 1em;
        }
      `}</style>
    </>
  )
}
