import { ActionPayload, generateReducer } from './generate-reducer';

interface IState {
  state: string;
  number: number;
}

const initialState: IState = {
  state: 'state',
  number: 1,
};

describe('generate-reducer', () => {
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
      increment: (state: IState) => { state.number += 1 } ,
    },
  };

  const generatedReducer = generateReducer(options);

  it('should return an actions object', () => {
    expect(generatedReducer.actions).toBeDefined();
  });

  it('should return have the correct number of actions', () => {
    expect(Object.keys(generatedReducer.actions).length).toBe(
      Object.keys(options.reducers).length
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
});
