import reduce from 'lodash/reduce';

const toUpperSnake = val =>
  val
    .replace(/[A-Z]/g, char => `_${char}`)
    .toUpperCase();

const generateActions = (actions, namespace) =>
  reduce(actions, (prev, action, type) =>
    ({
      ...prev,
      [type]: (...args) => ({
        type: toUpperSnake(`${namespace}/${type}`),
        payload:
          (typeof action() === 'function')
            ? state => action(...args)(state)
            : action(...args)
      }),
    }), {});

export const getPlainAction = action => {
  return ({ type: action.type, payload: action.payload.toString() })
};

export default generateActions;