import { modals } from '@mantine/modals'
import { Paper, Image } from '@mantine/core'
import useImgLoader from '#/hooks/use-img-loader'

type PropTypes = {
  init: boolean
  path: string
}

const PersonImageExpand = ({ init, path }: PropTypes) => {
  const { expandingLoading, handleOnLoad, imgRef } = useImgLoader({
    init,
    path,
  })
  return (
    <Paper>
      <Image
        ref={imgRef}
        onLoad={handleOnLoad}
        className={`w-full h-full object-cover ${expandingLoading ? 'invisible' : ''}`}
        alt={path}
        src={path}
      />
    </Paper>
  )
}

const OpenPersonImageExpand = (init: boolean, path: string) => {
  return modals.open({
    centered: true,
    styles: {
      content: {
        margin: 0,
        padding: 0,
        border: '2px solid black',
      },
      body: {
        margin: 0,
        padding: 0,
        border: '2px solid black',
      },
      header: {
        display: 'none',
      },
    },
    children: <PersonImageExpand init={init} path={path} />,
  })
}

export default OpenPersonImageExpand
