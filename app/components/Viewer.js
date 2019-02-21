import React, { useState } from 'react'

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

const LabelBox = ({ x, y, scale, children }) => (
  <g transform={`translate(${x} ${y}) scale(${1 / scale})`}>
    <foreignObject x="0" y="-32" width="150" height="50">
      <div xmlns="http://www.w3.org/1999/xhtml" classname="label-container">
        <div className="label-container">
          <span className="label-span">{children}</span>
        </div>
      </div>
    </foreignObject>
    <style jsx>{`
      .label-container {
        position: relative;
      }
      .label-box {
        box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.25);
        position: relative;
        top: 0;
        left: 0;
        max-width: 132px;
        margin-left: 0;
      }
      .label-span {
        background: rgba(0, 97, 255, 1);
        color: #fff;
        display: inline-block;
        box-sizing: border-box;
        max-width: 120px;
        text-overflow: ellipsis;
        overflow: hidden;
        whitespace: nowrap;
        padding: 7px 6px;
        user-select: none;
        opacity: 0.7;
        height: 32px;
      }
    `}</style>
  </g>
)

const Viewer = ({ file, objects, status }) => {
  const [scale, setScale] = useState()

  return (
    <div>
      {file && (
        <img onLoad={e => scaleView(e.target, setScale)} src={file.src} />
      )}
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
                <>
                  <rect
                    x={x}
                    y={y}
                    width={x1 - x}
                    height={y1 - y}
                    stroke="rgba(0, 97, 255, 1)"
                    fill="none"
                    strokeWidth={2 / scale}
                  />
                  <LabelBox x={x} y={y} scale={scale}>
                    {obj.class}
                  </LabelBox>
                </>
              )
            })}
          </g>
        </svg>
      )}
      {status === 'loading' && (
        <div className="loading">
          <div>Loading...</div>
        </div>
      )}
      <style jsx>{`
        div {
          position: relative;
        }
        img,
        svg,
        .loading {
          position: absolute;
          top: 0;
          left: 0;
        }
        img {
          max-width: 100%;
          max-height: 100%;
          ${status === 'loading' ? 'filter: blur(60px)' : ''}
        }
        svg,
        div,
        .loading {
          width: 100%;
          height: 100%;
        }
        .loading {
          background: rgba(0, 0, 0, 0.2);
          text-align: center;
          vtext-transform: uppercase;
          font-weight: bold;
          display: flex;
          justify-content: center;
        }
        .loading > div {
          color: rgba(255, 255, 255, 0.8);
          height: 1em;
          align-self: center;
        }
      `}</style>
    </div>
  )
}

export default Viewer
