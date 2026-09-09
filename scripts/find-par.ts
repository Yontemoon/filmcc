import 'dotenv/config'

import {
  intro,
  text,
  select,
  isCancel,
  cancel,
  spinner,
  log,
} from '@clack/prompts'
import { getSearchTmdbMovie, getSearchTmdbPerson } from '#/lib/fetch'
import { getPar } from '#/lib/server'

function bail(): never {
  cancel('Operation cancelled.')
  process.exit(0)
}

const main = async () => {
  console.clear()
  intro('Shortest Path — connect a movie to a person')

  const startingMovieSearch = await text({
    message: 'Type a movie you want to start with.',
    placeholder: 'The Odyssey',
    validate: (v) => (!v ? 'Please enter a movie title.' : undefined),
  })
  if (isCancel(startingMovieSearch)) bail()

  const movieSpin = spinner()
  movieSpin.start('Searching movies…')
  const movies = await getSearchTmdbMovie(startingMovieSearch)
  movieSpin.stop(`Found ${movies.results.length} movies.`)

  if (movies.results.length === 0) {
    log.error('No movies matched that search.')
    process.exit(1)
  }

  const selectedMovie = await select({
    message: 'Select the movie:',
    options: movies.results.map((movie) => ({
      value: movie.id,
      label: `${movie.title} — ${movie.release_date ?? '????'}`,
      hint: movie.overview.slice(0, 80),
    })),
  })
  if (isCancel(selectedMovie)) bail()

  const endingPersonSearch = await text({
    message: 'Type a person you want to end with.',
    placeholder: 'David Fincher',
    validate: (v) => (!v ? 'Please enter a person name.' : undefined),
  })
  if (isCancel(endingPersonSearch)) bail()

  const personSpin = spinner()
  personSpin.start('Searching people…')
  const people = await getSearchTmdbPerson(endingPersonSearch)
  personSpin.stop(`Found ${people.length} people.`)

  if (people.length === 0) {
    log.error('No people matched that search.')
    process.exit(1)
  }

  const selectedPerson = await select({
    message: 'Select the person:',
    options: people.map((person) => ({
      value: person.id,
      label: `${person.name} — ${person.known_for_department}`,
      hint: person.known_for
        .map((c) => c.title)
        .filter(Boolean)
        .join(', '),
    })),
  })
  if (isCancel(selectedPerson)) bail()

  await getPar(selectedMovie, selectedPerson)
}

main().catch((error) => {
  console.error('Something went wrong.')
  console.error(error)
  process.exit(1)
})
