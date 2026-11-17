import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  // active route: 'operations.exceptions' | 'operations.intake' | etc.
  activeRoute: 'operations.exceptions',
  roadmapModalAgent: null,
  showAuditDrawer: false,
  // Org config — can be changed per deployment
  orgConfig: {
    name: 'O2i - IRUS Enterprise AI',
    shortName: 'O2i',
    tagline: 'Autonomous Enterprise Intelligence Platform',
  },
};

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setActiveRoute: (state, action) => {
      state.activeRoute = action.payload;
    },
    toggleAuditDrawer: (state) => {
      state.showAuditDrawer = !state.showAuditDrawer;
    },
    setRoadmapModalAgent: (state, action) => {
      state.roadmapModalAgent = action.payload;
    },
    setOrgConfig: (state, action) => {
      state.orgConfig = { ...state.orgConfig, ...action.payload };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setActiveRoute,
  toggleAuditDrawer,
  setRoadmapModalAgent,
  setOrgConfig,
} = navigationSlice.actions;

export default navigationSlice.reducer;
