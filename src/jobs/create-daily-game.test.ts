import { describe, expect, it, vi, beforeEach } from 'vitest'
import { gameDateString, addDays, isIsoDay } from './date'

const findFirst = vi.fn()
const returning = vi.fn()
const onConflictDoUpdate = vi.fn()
const createRandomDaily = vi.fn()

// A chainable stub standing in for drizzle's insert builder. `.values()` returns
// both terminals so the same object serves the entity upsert and the
// daily_games insert.
const insert = vi.fn(() => ({
  values: () => ({ onConflictDoUpdate, returning }),
}))

vi.mock('#/lib/db', () => ({
  default: {
    query: { dailyGames: { findFirst } },
    transaction: (fn: (tx: unknown) => unknown) => fn({ insert }),
  },
}))

vi.mock('#/lib/server', () => ({
  createRandomDaily: () => createRandomDaily(),
}))

const { createDailyGame } = await import('./create-daily-game')

const MOVIE = {
  id: 73,
  title: 'American History X',
  poster_path: '/x2drgoXYZ8484lqyDj7L1CEVR4T.jpg',
  popularity: 21.5,
}
const PERSON = {
  id: 5655,
  name: 'Wes Anderson',
  profile_path: '/s03CeUeC5yAXyB1acqP0zGNo2SC.jpg',
  popularity: 8.2,
}

describe('date helpers', () => {
  it('formats an instant as the calendar day in the game timezone', () => {
    // 02:30 UTC on Aug 6 is 22:30 on Aug 5 in New York (EDT, UTC-4). This is
    // exactly the window a UTC-derived date would get wrong.
    const instant = new Date('2026-08-06T02:30:00Z')
    expect(gameDateString('America/New_York', 0, instant)).toBe('2026-08-05')
    expect(gameDateString('UTC', 0, instant)).toBe('2026-08-06')
  })

  it('offsets by whole calendar days across a month boundary', () => {
    const instant = new Date('2026-08-31T12:00:00Z')
    expect(gameDateString('UTC', 1, instant)).toBe('2026-09-01')
  })

  it('adds days without DST drift', () => {
    expect(addDays('2026-03-07', 1)).toBe('2026-03-08')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('rejects non-ISO days', () => {
    expect(isIsoDay('2026-08-05')).toBe(true)
    expect(isIsoDay('Wed Aug 05 2026')).toBe(false)
  })
})

describe('createDailyGame', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createRandomDaily.mockResolvedValue({ start: MOVIE, end: PERSON })
    returning.mockResolvedValue([{ id: 42 }])
    onConflictDoUpdate.mockResolvedValue(undefined)
    findFirst.mockResolvedValue(undefined)
  })

  it('generates and persists when the date is free', async () => {
    const result = await createDailyGame({ displayDate: '2026-08-06' })

    expect(result).toMatchObject({
      status: 'created',
      id: 42,
      displayDate: '2026-08-06',
      start: { type: 'MOVIE', id: 73, label: 'American History X' },
      end: { type: 'PERSON', id: 5655, label: 'Wes Anderson' },
    })
    // two entity upserts + one daily_games insert
    expect(insert).toHaveBeenCalledTimes(3)
  })

  it('is a no-op when a game already exists for the date', async () => {
    findFirst.mockResolvedValue({ id: 7 })

    const result = await createDailyGame({ displayDate: '2026-08-06' })

    expect(result).toEqual({
      status: 'exists',
      id: 7,
      displayDate: '2026-08-06',
    })
    expect(createRandomDaily).not.toHaveBeenCalled()
    expect(insert).not.toHaveBeenCalled()
  })

  it('treats a concurrent insert winning the race as success', async () => {
    returning.mockRejectedValue(Object.assign(new Error('dup'), { code: '23505' }))
    findFirst.mockResolvedValueOnce(undefined).mockResolvedValueOnce({ id: 9 })

    await expect(createDailyGame({ displayDate: '2026-08-06' })).resolves.toEqual(
      { status: 'exists', id: 9, displayDate: '2026-08-06' },
    )
  })

  it('retries generation, then throws when every attempt fails', async () => {
    // createRandomDaily swallows its errors and resolves undefined.
    createRandomDaily.mockResolvedValue(undefined)

    await expect(
      createDailyGame({ displayDate: '2026-08-06', attempts: 2 }),
    ).rejects.toThrow(/after 2 attempts/)
    expect(createRandomDaily).toHaveBeenCalledTimes(2)
    expect(insert).not.toHaveBeenCalled()
  })

  it('rejects a non-ISO display date before touching the database', async () => {
    await expect(
      createDailyGame({ displayDate: 'Wed Aug 05 2026' }),
    ).rejects.toThrow(/YYYY-MM-DD/)
    expect(findFirst).not.toHaveBeenCalled()
  })
})
