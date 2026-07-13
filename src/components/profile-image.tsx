import React, { useState } from 'react'
import type { ComponentProps } from 'react'
import { TMDB_IMAGE_PROFILE_URL } from '#/library/constants'

type ProfileImageProps = {
  profilePath: string | null | undefined
  creditId: string | number
  className?: string
} & ComponentProps<'div'>

const ProfileImage: React.FC<ProfileImageProps> = ({
  profilePath,
  creditId,
  className = 'w-10 h-10',
  ...props
}) => {
  const [hasError, setHasError] = useState(false)

  const showFallback = !profilePath || hasError

  return (
    <div
      className={`${className} overflow-hidden rounded-sm bg-slate-200 flex items-center justify-center shrink-0 hover:cursor-pointer`}
      {...props}
    >
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
        <img
          className="w-full h-full object-cover"
          alt={`image-${creditId}`}
          src={`${TMDB_IMAGE_PROFILE_URL}${profilePath}`}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  )
}

export default ProfileImage
