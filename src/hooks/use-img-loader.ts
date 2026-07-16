import React from 'react'

type PropTypes = {
  init: boolean
  path: string
}

const useImgLoader = ({ path, init }: PropTypes) => {
  const [expandingLoading, setExpandLoading] = React.useState<boolean>(init)
  const imgRef = React.useRef<HTMLImageElement>(null)

  const handleOnLoad = () => {
    setExpandLoading(false)
  }

  React.useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      handleOnLoad()
    }
  }, [init])

  React.useEffect(() => {
    setExpandLoading(init)
  }, [path])

  return { expandingLoading, handleOnLoad, imgRef }
}

export default useImgLoader
