import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

// Session state interface
interface SessionState {
  currentMode: string
  selectedType: string
  userProgress: Record<string, any>
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    animations: boolean
    apiConfig: any
  }
  creationHistory: Array<{
    id: string
    type: string
    mode: string
    timestamp: number
    data: any
  }>
  isInitialized: boolean
}

// Session actions
type SessionAction =
  | { type: 'SET_MODE'; payload: string }
  | { type: 'SET_TYPE'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: { key: string; value: any } }
  | { type: 'SET_PREFERENCES'; payload: Partial<SessionState['preferences']> }
  | { type: 'ADD_CREATION'; payload: SessionState['creationHistory'][0] }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'INITIALIZE_SESSION'; payload: Partial<SessionState> }
  | { type: 'RESET_SESSION' }

// Initial state
const initialState: SessionState = {
  currentMode: 'home',
  selectedType: 'character',
  userProgress: {},
  preferences: {
    theme: 'auto',
    animations: true,
    apiConfig: null
  },
  creationHistory: [],
  isInitialized: false
}

// Session reducer
function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, currentMode: action.payload }
    
    case 'SET_TYPE':
      return { ...state, selectedType: action.payload }
    
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [action.payload.key]: action.payload.value
        }
      }
    
    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload }
      }
    
    case 'ADD_CREATION':
      return {
        ...state,
        creationHistory: [action.payload, ...state.creationHistory.slice(0, 49)] // Keep last 50
      }
    
    case 'CLEAR_HISTORY':
      return { ...state, creationHistory: [] }
    
    case 'INITIALIZE_SESSION':
      return { ...state, ...action.payload, isInitialized: true }
    
    case 'RESET_SESSION':
      return { ...initialState, isInitialized: true }
    
    default:
      return state
  }
}

// Context
interface SessionContextType {
  state: SessionState
  dispatch: React.Dispatch<SessionAction>
  // Helper functions
  setMode: (mode: string) => void
  setType: (type: string) => void
  updateProgress: (key: string, value: any) => void
  setPreferences: (prefs: Partial<SessionState['preferences']>) => void
  addCreation: (creation: Omit<SessionState['creationHistory'][0], 'timestamp'>) => void
  clearHistory: () => void
  resetSession: () => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

// Provider component
interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [state, dispatch] = useReducer(sessionReducer, initialState)

  // Initialize session from localStorage on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('beatleap-session')
      if (savedSession) {
        const parsed = JSON.parse(savedSession)
        dispatch({ type: 'INITIALIZE_SESSION', payload: parsed })
      } else {
        dispatch({ type: 'INITIALIZE_SESSION', payload: {} })
      }
    } catch (error) {
      console.error('Failed to load session:', error)
      dispatch({ type: 'INITIALIZE_SESSION', payload: {} })
    }
  }, [])

  // Save session to localStorage whenever state changes
  useEffect(() => {
    if (state.isInitialized) {
      try {
        localStorage.setItem('beatleap-session', JSON.stringify(state))
      } catch (error) {
        console.error('Failed to save session:', error)
      }
    }
  }, [state])

  // Helper functions
  const setMode = (mode: string) => {
    dispatch({ type: 'SET_MODE', payload: mode })
  }

  const setType = (type: string) => {
    dispatch({ type: 'SET_TYPE', payload: type })
  }

  const updateProgress = (key: string, value: any) => {
    dispatch({ type: 'UPDATE_PROGRESS', payload: { key, value } })
  }

  const setPreferences = (prefs: Partial<SessionState['preferences']>) => {
    dispatch({ type: 'SET_PREFERENCES', payload: prefs })
  }

  const addCreation = (creation: Omit<SessionState['creationHistory'][0], 'timestamp'>) => {
    dispatch({
      type: 'ADD_CREATION',
      payload: { ...creation, timestamp: Date.now() }
    })
  }

  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' })
  }

  const resetSession = () => {
    dispatch({ type: 'RESET_SESSION' })
  }

  const contextValue: SessionContextType = {
    state,
    dispatch,
    setMode,
    setType,
    updateProgress,
    setPreferences,
    addCreation,
    clearHistory,
    resetSession
  }

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}

// Hook to use session context
export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

export default SessionContext