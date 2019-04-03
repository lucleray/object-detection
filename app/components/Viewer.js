import React, { useState, useRef, useEffect } from 'react'

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
  const translateX = 30
  const translateY = 30

  const divEl = useRef(null)
  const imgEl = useRef(null)

  const scaleView = () => {
    if (!imgEl.current || !divEl.current) return

    const { naturalWidth, naturalHeight } = imgEl.current
    const { width, height } = divEl.current.getBoundingClientRect()

    const minScaleX = (width - translateX * 2) / naturalWidth
    const minScaleY = (height - translateY * 2) / naturalHeight

    setScale(Math.min(minScaleX, minScaleY, 1))
  }

  useEffect(() => {
    window.addEventListener('resize', scaleView)
    return () => {
      window.removeEventListener('resize', scaleView)
    }
  }, [])

  const transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`

  return (
    <div ref={divEl} className={'viewer ' + (file ? 'open' : '')}>
      {file && (
        <div className="img-container" style={{ transform }}>
          <img ref={imgEl} onLoad={scaleView} src={file.src} />
        </div>
      )}
      {scale && (
        <svg>
          <g style={{ transform }}>
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
                    {obj.class}{' '}
                    <span style={{ opacity: 0.6 }}>
                      {Math.round(obj.score * 100)}%
                    </span>
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
        .viewer {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .img-container,
        svg,
        .loading {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .img-container {
          transform-origin: 0 0;
        }
        img {
          max-width: none;
          max-height: none;
          ${status === 'loading' ? 'filter: blur(60px);' : ''}
        }
        @media screen and (max-width: 1000px) {
          .viewer.open {
            height: 500px;
          }
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
