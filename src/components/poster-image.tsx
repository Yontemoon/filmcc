import React from 'react'
import type { ComponentProps } from 'react'
import { TMDB_IMAGE_POSTER_URL } from '#/library/constants'

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
  const [hasError, setHasError] = React.useState(false)

  const showFallback = !posterPath || hasError

  return (
    <div
      className={`${className} overflow-hidden rounded-md bg-slate-800 flex items-center justify-center shrink-0 shadow-sm border border-slate-700 hover:cursor-pointer`}
      {...props}
    >
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
        <img
          className="w-full h-full object-cover"
          alt={`${altText}-${id}`}
          src={`${TMDB_IMAGE_POSTER_URL}${posterPath}`}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  )
}

export default PosterImage
