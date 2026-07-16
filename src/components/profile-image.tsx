import React, { useState } from 'react'
import type { ComponentProps } from 'react'
import {
  TMDB_IMAGE_PROFILE_URL,
  TMDB_IMAGE_PROFILE_URL_EXPAND,
} from '#/library/constants'
import { HoverCard, Group } from '@mantine/core'
import Spinner from './ui/spinner'
import useImgLoader from '#/hooks/use-img-loader'

type ProfileImageProps = {
  profilePath: string | null | undefined
  creditId: string | number
  className?: string
  showExpand?: boolean
} & ComponentProps<'div'>

const ProfileImage: React.FC<ProfileImageProps> = ({
  profilePath,
  creditId,
  showExpand = false,
  className = 'w-10 h-10',
  ...props
}) => {
  const expandedProfileUrl = profilePath
    ? `${TMDB_IMAGE_PROFILE_URL_EXPAND}${profilePath}`
    : ''

  const [hasError, setHasError] = useState(false)
  const pathBool = Boolean(profilePath)

  const { expandingLoading, handleOnLoad, imgRef } = useImgLoader({
    init: pathBool,
    path: expandedProfileUrl,
  })

  const showFallback = !profilePath || hasError

  return (
    <Group>
      <div
        className={`${className} overflow-hidden rounded-sm bg-slate-200 flex items-center justify-center shrink-0 hover:cursor-pointer`}
        {...props}
      >
        <HoverCard width={280} shadow="md" position="right" openDelay={300}>
          {showFallback ? (
            <svg
              className="w-1/2 h-1/2 text-slate-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <HoverCard.Target>
              <img
                className="w-full h-full object-cover"
                alt={`image-${creditId}`}
                src={`${TMDB_IMAGE_PROFILE_URL}${profilePath}`}
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
                  alt={`image-${creditId}-expand`}
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

export default ProfileImage
