import ReactDropzone from 'react-dropzone'

const Dropzone = ({ setStatus, setFile, setObjects, fetchPredict }) => (
  <>
    <ReactDropzone
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
          fetchPredict(file, setObjects, setStatus)
        }
      }}
    >
      {({ getRootProps, getInputProps }) => {
        return (
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            <p>Drag an image here</p>
            <p>(png/jpeg)</p>
          </div>
        )
      }}
    </ReactDropzone>
    <style jsx>{`
      .dropzone {
        border: 1px dashed #777;
        border-radius: 5px;
        padding: 50px;
        text-align: center;
        margin-bottom: 2em;
      }
      .dropzone > p {
        text-transform: uppercase;
        font-weight: bold;
      }
    `}</style>
  </>
)

export default Dropzone
