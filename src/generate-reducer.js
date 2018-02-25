import map from 'lodash/map';
import includes from 'lodash/includes';
import mergeWith from 'lodash/mergeWith'
import isArray from 'lodash/isArray'

function overwriteArray(obj, src) {
  if (isArray) return src;
}

const generateReducer =
  (initialState, generatedActions) => {
    // save actionsTypes in an array to avoid re-iteration
    const actionsTypes = map(generatedActions, action => action().type);

    return (state = initialState, action) =>
      includes(actionsTypes, action.type)
        ? (mergeWith(
          {},
          state,
          // if the payload is a function we'll inject state into it
          ((typeof action.payload === 'function')
            ? action.payload(state)
            : action.payload ),
          overwriteArray))
        : state;
  };

export default generateReducer;