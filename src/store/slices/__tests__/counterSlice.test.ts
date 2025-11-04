import { counterSlice } from '@/store/slices/counterSlice';

describe('counterSlice', () => {
  const initialState = { value: 0 }; // Example initial state

  it('should increment the value', () => {
    const nextState = counterSlice.reducer(initialState, counterSlice.actions.increment());
    expect(nextState.value).toBe(1); // State value should increase by 1
  });

  it('should decrement the value', () => {
    const nextState = counterSlice.reducer({ value: 1 }, counterSlice.actions.decrement());
    expect(nextState.value).toBe(0); // State value should decrease by 1
  });

  it('should increment by a specific amount', () => {
    const nextState = counterSlice.reducer(initialState, counterSlice.actions.incrementByAmount(5));
    expect(nextState.value).toBe(5); // State value should increase by 5
  });
});
