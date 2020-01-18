import { ActionPayload, reduxDryer } from './redux-dryer';

interface IState {
  state: string;
  number: number;
}

const initialState: IState = {
  state: 'state',
  number: 1,
};

describe('reduxDryer', () => {
  const options = {
    namespace: 'namespace',
    initialState,
    reducers: {
      someReducer: (
        state: IState,
        action: ActionPayload<{ state: string }>
      ) => {
        state.state = action.payload.state;
      },
      increment: (state: IState) => {
        state.number += 1;
      },
    },
  };

  describe('When all options are passed', () => {
    const generatedReducer = reduxDryer(options);

    it('should return an actions object', () => {
      expect(generatedReducer.actions).toBeDefined();
    });

    it('should return default state when teh reducer is called with undefined', () => {
      // @ts-ignore because we are saying we are always passing state in the type definitions
      expect(generatedReducer.reducer(undefined, { type: 'some_action' }));
    });

    it('should return have the correct number of actions', () => {
      expect(Object.keys(generatedReducer.actions).length).toBe(
        Object.keys(options.reducers).length
      );
    });

    it('should include the namespace in the action type', () => {
      expect(generatedReducer.actions.increment().type).toBe(
        `${options.namespace}/increment`
      );
    });

    it('should return correct sate after calling the action with payload', () => {
      expect(
        generatedReducer.reducer(
          options.initialState,
          generatedReducer.actions.someReducer({ state: 'newState' })
        )
      ).toEqual({ state: 'newState', number: 1 });
    });

    it('should return correct sate after calling the action without payload', () => {
      expect(
        generatedReducer.reducer(
          options.initialState,
          generatedReducer.actions.increment()
        )
      ).toEqual({ state: 'state', number: 2 });
    });

    it('should return initialState when the action does not exist', () => {
      expect(
        generatedReducer.reducer(options.initialState, { type: 'non_existent' })
      ).toEqual(options.initialState);
    });
  });

  describe('When the namespace is not passed', () => {
    const generatedReducer = reduxDryer({
      ...options,
      namespace: undefined,
    });

    it('should return type without namespace', () => {
      expect(generatedReducer.actions.increment().type).toBe('increment');
    });
  });
});
