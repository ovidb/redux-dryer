# Redux-dryer

Keep your redux stores as dry as possible

### Installing

```npm install redux-dryer```

## Useage

### Generating Actions

`wallet-actions.js`
```javascript
import { generateActions } from 'redux-dryer';

const WalletActions = {
  setBalance: balance => ({ balance }),
  depositAmount: amount => state => ({ balance: state.balance + amount }),
  withdrawAmount: amount => state => ({ balance: state.balance - amount }),
};

export default generateActions(WalletActions, 'wallet');

```


### Generating Reducers

`wallet-reducer.js`

```javascript
import { generateReducer } from 'redux-dryer';
import WalletActions from '../actions/wallet';

const INITIAL_STATE = { balance: 0 };

export default generateReducer(INITIAL_STATE, WalletActions);

```

That's all you need to do, and now your reducer will listen and respond to your actions

### Combining reducer

It works the same as a normal reducer.

`reducers.js`
```javascript
import walletReducer from './wallet-reducer.js';

export default combineReducers({
  wallet: walletReducer,
  ...
})
```

`App.js`

```jsx harmony
import React from 'react';
import ReactDOM from 'react-dom';
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducers from './reducers';

const store = createStore(reducers);

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
);
```
