import React, { useState } from 'react'
import type { ComponentProps } from 'react'
import {
  TMDB_IMAGE_PROFILE_URL,
  TMDB_IMAGE_PROFILE_URL_EXPAND,
} from '#/lib/constants'
import Paper from './ui/paper/paper'
import { Image } from '@mantine/core'
import OpenPersonImageExpand from './modals/image-expand'

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

  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = useState(false)
  const pathBool = Boolean(profilePath)

  const showFallback = !profilePath || hasError

  return (
    <Paper {...props}>
      {showFallback ? (
        <div className="flex items-center justify-center h-full">
          <svg
            className="w-1/2 h-1/2 text-slate-400"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      ) : (
        <div
          className={`h-full w-full hover:cursor-pointer transition-opacity duration-200 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            className="h-full w-full object-cover"
            onLoad={() => setIsLoaded(true)}
            alt={`image-${creditId}`}
            src={`${TMDB_IMAGE_PROFILE_URL}${profilePath}`}
            onError={() => setHasError(true)}
            onClick={(e) => {
              e.stopPropagation()
              OpenPersonImageExpand(pathBool, expandedProfileUrl)
            }}
          />
        </div>
      )}
    </Paper>
  )
}

export default ProfileImage
