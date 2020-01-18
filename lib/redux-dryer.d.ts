import { Draft } from 'immer';
export declare const reduxDryer: <State, R extends Reducers<State, any>>(options: IOptions<State, R>) => IOutput<State, ActionCreatorsOutput<R>>;
export declare type ActionPayload<P = any> = IAction & {
    payload: P;
};
interface IOptions<State = any, R extends Reducers<State, any> = Reducers<State, any>> {
    namespace?: string;
    initialState: State;
    reducers: R;
}
interface IOutput<State = any, ActionCreators extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> {
    reducer: Reducer<State>;
    actions: ActionCreators;
}
interface IAnyAction extends IAction {
    [extraProps: string]: any;
}
interface IAction {
    type: string;
}
declare type Reducer<S = any, A extends IAction = IAnyAction> = (state: S, action: A) => S;
declare type ImmerReducer<S = any, A extends IAction = IAnyAction> = (state: Draft<S>, action: A) => S | void;
declare type ActionsWithPayload<Types extends keyof any = string> = Record<Types, ActionPayload>;
declare type Reducers<State, PA extends ActionsWithPayload> = {
    [ActionType in keyof PA]: ImmerReducer<State, PA[ActionType]>;
};
declare type ActionCreatorWithPayload<P = any> = (payload: P) => ActionPayload<P>;
declare type RemovePayload<T, CallableAction> = {
    type: T;
} & CallableAction;
declare type ActionCreatorWithoutPayload<T extends string = string> = RemovePayload<T, () => ActionPayload<undefined>>;
declare type PayloadForReducer<R> = R extends (state: any, action: ActionPayload<infer P>) => any ? P : void;
declare type ActionCreatorsOutput<ReducersMap extends Reducers<any, any>> = {
    [Type in keyof ReducersMap]: IfNoPayload<ReducersMap[Type], ActionCreatorWithoutPayload, ActionCreatorWithPayload<PayloadForReducer<ReducersMap[Type]>>>;
};
declare type IfNoPayload<R, True, False = never> = R extends (state: any) => any ? True : False;
export {};
