import React from 'react'
import type { ComponentProps } from 'react'
import {
  TMDB_IMAGE_POSTER_URL,
  TMDB_IMAGE_POSTER_URL_EXPAND,
} from '#/library/constants'
import { HoverCard, Group } from '@mantine/core'
import useImgLoader from '#/hooks/use-img-loader'
import Spinner from './ui/spinner'

type PosterImageProps = {
  posterPath: string | null | undefined
  id: number | string
  altText?: string
  className?: string
} & ComponentProps<'div'>

const PosterImage = ({
  posterPath,
  id,
  altText = 'Movie poster',
  className = 'w-10 h-15',
  ...props
}: PosterImageProps) => {
  const expandedProfileUrl = posterPath
    ? `${TMDB_IMAGE_POSTER_URL_EXPAND}${posterPath}`
    : ''

  const [hasError, setHasError] = React.useState(false)
  const pathBool = Boolean(posterPath)

  const { expandingLoading, handleOnLoad, imgRef } = useImgLoader({
    init: pathBool,
    path: expandedProfileUrl,
  })

  const showFallback = !posterPath || hasError

  return (
    <Group>
      <div
        className={`${className} overflow-hidden rounded-md bg-slate-800 flex items-center justify-center shrink-0 shadow-sm border border-slate-700 hover:cursor-pointer`}
        {...props}
      >
        <HoverCard shadow="md" width={280} openDelay={300}>
          {showFallback ? (
            // Backup UI: Clean Movie/Film Icon
            <svg
              className="w-1/3 h-1/3 text-slate-500"
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
          ) : (
            <HoverCard.Target>
              <img
                className="w-full h-full object-cover"
                alt={`${altText}-${id}`}
                src={`${TMDB_IMAGE_POSTER_URL}${posterPath}`}
                onError={() => setHasError(true)}
              />
            </HoverCard.Target>
          )}
          {!showFallback && (
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
      </div>
    </Group>
  )
}

export default PosterImage
