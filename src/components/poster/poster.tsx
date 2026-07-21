import React from 'react'
import type { ComponentProps } from 'react'
import {
  TMDB_IMAGE_POSTER_URL,
  TMDB_IMAGE_POSTER_URL_EXPAND,
} from '#/library/constants'
import { HoverCard } from '@mantine/core'
import useImgLoader from '#/hooks/use-img-loader'
import Spinner from '#/components/ui/spinner'
import { Image } from '@unpic/react'
import Paper from '../ui/paper/paper'

type PosterImageProps = {
  posterPath: string | null | undefined
  id: number | string
  showExpand?: boolean
  altText?: string
  className?: string
  hd?: boolean
} & ComponentProps<'div'>

const Poster = ({
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
    <Paper withBorder {...props} opacity={isLoaded ? '100' : '0'}>
      <HoverCard width="280" shadow="md">
        {showFallback ? (
          <div className="flex h-full w-full items-center justify-center bg-slate-800">
            <svg
              className="h-2/3 w-2/3 text-slate-500"
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
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 00-1 1z"
              />
            </svg>
          </div>
        ) : (
          <HoverCard.Target>
            <div
              className={`h-full w-full hover:cursor-pointer transition-opacity duration-200 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                layout="fullWidth"
                className="h-full w-full object-cover"
                alt={`${altText}-${id}`}
                onLoad={() => setIsLoaded(true)}
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
              <div className={expandingLoading ? 'invisible' : ''}>
                <Paper withBorder>
                  <Image
                    ref={imgRef}
                    layout="fullWidth"
                    onLoad={handleOnLoad}
                    className={`h-full w-full object-cover ${
                      expandingLoading ? 'invisible' : ''
                    }`}
                    alt={`image-${id}-expand`}
                    src={expandedProfileUrl}
                    onError={() => setHasError(true)}
                  />
                </Paper>
              </div>
            </div>
          </HoverCard.Dropdown>
        )}
      </HoverCard>
    </Paper>
  )
}

export default Poster
