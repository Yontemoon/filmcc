import React from 'react'
import type { ComponentProps } from 'react'
import {
  TMDB_IMAGE_POSTER_URL,
  TMDB_IMAGE_POSTER_URL_EXPAND,
} from '#/library/constants'
import { HoverCard, Group } from '@mantine/core'
import useImgLoader from '#/hooks/use-img-loader'
import Spinner from './ui/spinner'
import { Image } from '@unpic/react'

type PosterImageProps = {
  posterPath: string | null | undefined
  id: number | string
  showExpand?: boolean
  altText?: string
  className?: string
  hd?: boolean
} & ComponentProps<'div'>

const PosterImage = ({
  posterPath,
  id,
  showExpand = true,
  altText = 'Movie poster',
  className = 'w-10 h-15',
  hd = false,
  ...props
}: PosterImageProps) => {
  const expandedProfileUrl = posterPath
    ? `${TMDB_IMAGE_POSTER_URL_EXPAND}${posterPath}`
    : ''

  const [hasError, setHasError] = React.useState(false)
  const pathBool = Boolean(posterPath)
  const [isLoaded, setIsLoaded] = React.useState(false)

  const { expandingLoading, handleOnLoad, imgRef } = useImgLoader({
    init: pathBool,
    path: expandedProfileUrl,
  })

  const showFallback = !posterPath || hasError

  return (
    <Group>
      <HoverCard shadow="md" width={280} openDelay={300}>
        {showFallback ? (
          <div
            className={`${className} shrink-0 aspect-2/3 overflow-hidden rounded-md bg-slate-800 flex items-center justify-center border border-slate-700 shadow-sm`}
          >
            <svg
              className="w-2/3 h-2/3 text-slate-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
          </div>
        ) : (
          <HoverCard.Target>
            <div
              className={`${isLoaded ? 'opacity-100' : 'opacity-0'} ${className} min-h-full min-w-full shrink-0 aspect-2/3 border hover:border-3 overflow-hidden rounded-md bg-slate-800 flex items-center justify-center shadow-sm border-slate-700 hover:cursor-pointer`}
              {...props}
            >
              <Image
                layout="fullWidth"
                className="w-full h-full object-fill"
                alt={`${altText}-${id}`}
                onLoad={() => {
                  setIsLoaded(true)
                }}
                src={
                  hd
                    ? `${expandedProfileUrl}`
                    : `${TMDB_IMAGE_POSTER_URL}${posterPath}`
                }
                onError={() => setHasError(true)}
              />
            </div>
          </HoverCard.Target>
        )}
        {!showFallback && showExpand && (
          <HoverCard.Dropdown className="fixed! top-4! right-4! left-auto! transform-none!">
            <div className="relative flex min-h-24 min-w-24 items-center justify-center">
              {expandingLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner />
                </div>
              )}
              <img
                ref={imgRef}
                onLoad={handleOnLoad}
                className={`w-full h-full object-cover ${expandingLoading ? 'invisible' : ''}`}
                alt={`image-${id}-expand`}
                src={expandedProfileUrl}
                onError={() => setHasError(true)}
              />
            </div>
          </HoverCard.Dropdown>
        )}
      </HoverCard>
    </Group>
  )
}

export default PosterImage
