import { modals } from '@mantine/modals'
import { Image } from '@mantine/core'
import useImgLoader from '#/hooks/use-img-loader'

const MAX_HEIGHT = 'calc(100dvh - var(--modal-y-offset) * 2)'
const MAX_WIDTH = 'calc(100vw - var(--modal-x-offset) * 2)'
const MIN_WIDTH = `min(calc(17.5rem * var(--mantine-scale)), ${MAX_WIDTH})`

type PropTypes = {
  init: boolean
  path: string
}

const ImageExpand = ({ init, path }: PropTypes) => {
  const { expandingLoading, handleOnLoad, imgRef } = useImgLoader({
    init,
    path,
  })

  return (
    <Image
      ref={imgRef}
      onLoad={handleOnLoad}
      className={expandingLoading ? 'invisible' : ''}
      style={{
        width: 'auto',
        height: 'auto',
        maxHeight: MAX_HEIGHT,

        objectFit: 'contain',
      }}
      alt={path}
      src={path}
    />
  )
}

const ImageExpandModal = (init: boolean, path: string) => {
  return modals.open({
    centered: true,

    styles: {
      content: {
        flex: '0 0 autopnp',
        width: 'auto',
        minWidth: MIN_WIDTH,
        maxWidth: MAX_WIDTH,
        maxHeight: MAX_HEIGHT,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      },
      body: {
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        width: 'auto',
      },
      header: {
        display: 'none',
      },
    },
    children: <ImageExpand init={init} path={path} />,
  })
}

export default ImageExpandModal
