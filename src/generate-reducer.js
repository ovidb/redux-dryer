import map from 'lodash/map';
import includes from 'lodash/includes';
import merge from 'lodash/merge'

const generateReducer =
  (initialState, generatedActions) => {
    // save actionsTypes in an array to avoid re-iteration
    const actionsTypes = map(generatedActions, action => action().type);

    return (state = initialState, action) =>
      includes(actionsTypes, action.type)
        ? (merge(
          {},
          state,
          // if the payload is a function we'll inject state into it
          ((typeof action.payload === 'function')
            ? action.payload(state)
            : action.payload )))
        : state;
  };

export default generateReducer;