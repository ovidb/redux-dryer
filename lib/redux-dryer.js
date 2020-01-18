"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immer_1 = require("immer");
exports.reduxDryer = function (options) {
    var initialState = options.initialState, namespace = options.namespace;
    var reducers = options.reducers;
    var actionTypes = Object.keys(reducers);
    var reducerMap = actionTypes.reduce(function (map, action) {
        var type = getType(namespace, action);
        map[type] = reducers[action];
        return map;
    }, {});
    var actionMap = actionTypes.reduce(function (map, action) {
        var type = getType(namespace, action);
        map[action] = createAction(type);
        return map;
    }, {});
    return {
        actions: actionMap,
        reducer: function (state, action) {
            if (state === void 0) { state = initialState; }
            return immer_1.default(state, function (draft) {
                var reducer = reducerMap[action.type];
                return reducer ? reducer(draft, action) : undefined;
            });
        },
    };
};
function getType(namespace, actionKey) {
    return namespace ? namespace + "/" + actionKey : actionKey;
}
function createAction(type) {
    return function (payload) { return ({ type: type, payload: payload }); };
}
