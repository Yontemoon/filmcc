import React, { createContext, useContext, useState } from 'react'

type LayoutTypes = 'grid' | 'table' | null
const LOCAL_STORAGE_KEY = 'game_layout'

interface PropTypes {
  state: LayoutTypes
  updateState: (newValue: LayoutTypes) => void
}

const AppContext = createContext<PropTypes | undefined>(undefined)

const LayoutGameProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<LayoutTypes>(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY)

      return item ? (item as LayoutTypes) : 'table'
    } catch (error) {
      console.log('Error reading localStorage key', LOCAL_STORAGE_KEY, error)
      return 'table'
    }
  })

  React.useEffect(() => {
    if (state) window.localStorage.setItem(LOCAL_STORAGE_KEY, state)
  }, [state, setState])

  const updateState = (newValue: LayoutTypes) => {
    setState(newValue)
  }

  return <AppContext value={{ state, updateState }}>{children}</AppContext>
}

const useLayoutGameProvider = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export { LayoutGameProvider, useLayoutGameProvider }
