type TType = 'movie' | 'person' | undefined

type TController = {
  type: TType
  id: number
  label: string
}

export type { TType, TController }
