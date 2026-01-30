'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type { ExplanationResponse, AppSettings, AppState, ToastMessage } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import { getSettings, updateSettings as updateSettingsService } from '@/services/settings';

interface AppContextState {
  currentExplanation: ExplanationResponse | null;
  appState: AppState;
  settings: AppSettings;
  toasts: ToastMessage[];
  error: string | null;
}

type AppAction =
  | { type: 'SET_EXPLANATION'; payload: ExplanationResponse }
  | { type: 'CLEAR_EXPLANATION' }
  | { type: 'SET_APP_STATE'; payload: AppState }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'ADD_TOAST'; payload: ToastMessage }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_SAVED'; payload: boolean };

const initialState: AppContextState = {
  currentExplanation: null,
  appState: 'idle',
  settings: DEFAULT_SETTINGS,
  toasts: [],
  error: null,
};

function appReducer(state: AppContextState, action: AppAction): AppContextState {
  switch (action.type) {
    case 'SET_EXPLANATION':
      return {
        ...state,
        currentExplanation: action.payload,
        appState: 'results',
        error: null,
      };
    case 'CLEAR_EXPLANATION':
      return {
        ...state,
        currentExplanation: null,
        appState: 'idle',
      };
    case 'SET_APP_STATE':
      return {
        ...state,
        appState: action.payload,
      };
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload,
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        appState: action.payload ? 'error' : state.appState,
      };
    case 'TOGGLE_SAVED':
      if (!state.currentExplanation) return state;
      return {
        ...state,
        currentExplanation: {
          ...state.currentExplanation,
          isSaved: action.payload,
        },
      };
    default:
      return state;
  }
}

interface AppContextValue extends AppContextState {
  setExplanation: (explanation: ExplanationResponse) => void;
  clearExplanation: () => void;
  setAppState: (state: AppState) => void;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
  setError: (error: string | null) => void;
  toggleCurrentSaved: (isSaved: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    void getSettings().then((settings) => {
      dispatch({ type: 'SET_SETTINGS', payload: settings });
    });
  }, []);

  const setExplanation = useCallback((explanation: ExplanationResponse) => {
    dispatch({ type: 'SET_EXPLANATION', payload: explanation });
  }, []);

  const clearExplanation = useCallback(() => {
    dispatch({ type: 'CLEAR_EXPLANATION' });
  }, []);

  const setAppState = useCallback((appState: AppState) => {
    dispatch({ type: 'SET_APP_STATE', payload: appState });
  }, []);

  const updateSettings = useCallback(async (settings: Partial<AppSettings>) => {
    const updated = await updateSettingsService(settings);
    dispatch({ type: 'SET_SETTINGS', payload: updated });
  }, []);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = `toast_${Date.now()}`;
    dispatch({ type: 'ADD_TOAST', payload: { id, type, message } });
    
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const toggleCurrentSaved = useCallback((isSaved: boolean) => {
    dispatch({ type: 'TOGGLE_SAVED', payload: isSaved });
  }, []);

  const value: AppContextValue = {
    ...state,
    setExplanation,
    clearExplanation,
    setAppState,
    updateSettings,
    addToast,
    removeToast,
    setError,
    toggleCurrentSaved,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
