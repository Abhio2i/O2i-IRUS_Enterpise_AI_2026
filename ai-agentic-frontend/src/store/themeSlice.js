import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('theme_mode');
    if (saved === 'black' || saved === 'white') return saved;
  } catch (_) {}
  return 'white'; // Default White Mode
};

const initialState = {
  mode: getInitialTheme(),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'black' ? 'white' : 'black';
      try { localStorage.setItem('theme_mode', state.mode); } catch (_) {}
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      try { localStorage.setItem('theme_mode', state.mode); } catch (_) {}
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
