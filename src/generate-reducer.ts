import produce, { Draft } from 'immer';

export const generateReducer = <State, R extends Reducers<State, any>>(
  options: IOptions<State, R>
): IOutput<State, ActionCreatorsOutput<R>> => {
  const { initialState, namespace } = options;
  const reducers = options.reducers;
  const actionTypes = Object.keys(reducers);

  const reducerMap = actionTypes.reduce(
    (map, action) => {
      const type = getType(namespace, action);
      map[type] = reducers[action];
      return map;
    },
    {} as any
  );

  const actionMap = actionTypes.reduce(
    (map, action) => {
      const type = getType(namespace, action);
      map[action] = createAction(type);
      return map;
    },
    {} as any
  );

  return {
    actions: actionMap,
    reducer: (state = initialState, action) => {
      return produce(state, draft => {
        const reducer = reducerMap[action.type];
        return reducer ? reducer(draft, action) : undefined;
      });
    },
  };
};

export type ActionPayload<P = any> = IAction & {
  payload: P;
};

interface IOptions<
  State = any,
  R extends Reducers<State, any> = Reducers<State, any>
> {
  namespace?: string;
  initialState: State;
  reducers: R;
}

interface IOutput<
  State = any,
  ActionCreators extends { [key: string]: any } = { [key: string]: any }
> {
  reducer: Reducer<State>;
  actions: ActionCreators;
}

function getType(namespace: string | undefined, actionKey: string): string {
  return namespace ? `${namespace}/${actionKey}` : actionKey;
}

function createAction<P = any, T extends string = string>(
  type: string
): ActionCreatorWithPayload<P> {
  return (payload: P) => ({ type, payload });
}

interface IAnyAction extends IAction {
  // Allows any extra properties to be defined in an action.
  [extraProps: string]: any;
}

interface IAction {
  type: string;
}

type Reducer<S = any, A extends IAction = IAnyAction> = (
  state: S,
  action: A
) => S;

type ImmerReducer<S = any, A extends IAction = IAnyAction> = (
  state: Draft<S>,
  action: A
) => S | void;

type ActionsWithPayload<Types extends keyof any = string> = Record<
  Types,
  ActionPayload
>;

type Reducers<State, PA extends ActionsWithPayload> = {
  [ActionType in keyof PA]: ImmerReducer<State, PA[ActionType]>;
};

type ActionCreatorWithPayload<P = any> = (payload: P) => ActionPayload<P>;

type RemovePayload<T, CallableAction> = {
  type: T;
} & CallableAction;

type ActionCreatorWithoutPayload<T extends string = string> = RemovePayload<
  T,
  () => ActionPayload<undefined>
>;

type PayloadForReducer<R> = R extends (
  state: any,
  action: ActionPayload<infer P>
) => any
  ? P
  : void;

type ActionCreatorsOutput<ReducersMap extends Reducers<any, any>> = {
  [Type in keyof ReducersMap]: IfNoPayload<
    ReducersMap[Type],
    ActionCreatorWithoutPayload,
    // else
    ActionCreatorWithPayload<PayloadForReducer<ReducersMap[Type]>>
  >;
};

type IfNoPayload<R, True, False = never> = R extends (state: any) => any
  ? True
  : False;
