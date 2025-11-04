import { appSlice } from '@/store/slices/appSlice';

describe('appSlice', () => {
  const initialState = { isSidebarOpen: false }; // Example initial state

  it('should open the sidebar', () => {
    const nextState = appSlice.reducer(initialState, appSlice.actions.toggleSidebar());
    expect(nextState.isSidebarOpen).toBe(true); // State value should increase by 1
  });

  it('should close the sidebar', () => {
    const nextState = appSlice.reducer({ isSidebarOpen: true }, appSlice.actions.toggleSidebar());
    expect(nextState.isSidebarOpen).toBe(false); // State value should decrease by 1
  });
});
