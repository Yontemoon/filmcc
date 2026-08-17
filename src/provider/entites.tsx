import React from 'react'
import { LOCAL_STORAGE_ENTITY_KEY } from '#/lib/constants'

interface PropTypes {
  hideUsedEntities: boolean
  toggleShowEntities: () => void
}
const EntitiesContext = React.createContext<PropTypes | undefined>(undefined)

const EntitiesProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = React.useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(LOCAL_STORAGE_ENTITY_KEY)
        return item ? (JSON.parse(item) as boolean) : false
      }
      return false
    } catch (error) {
      console.log(
        'Error reading localStorage key',
        LOCAL_STORAGE_ENTITY_KEY,
        error,
      )
      return false
    }
  })

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_ENTITY_KEY, JSON.stringify(state))
    }
  }, [state, setState])

  const toggleShowEntities = () => {
    setState(!state)
  }

  return (
    <EntitiesContext
      value={{
        hideUsedEntities: state,
        toggleShowEntities: toggleShowEntities,
      }}
    >
      {' '}
      {children}
    </EntitiesContext>
  )
}

const useEntitiesProvider = () => {
  const context = React.useContext(EntitiesContext)

  if (context === undefined) {
    throw new Error(
      'useEntitiesProvider must be used within an EntitiesProvider',
    )
  }

  return context
}

export { EntitiesProvider, useEntitiesProvider }
