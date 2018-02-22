# Redux-dryer

Keep your redux stores as dry as possible

#### [Playground](https://codesandbox.io/s/64joqv325k)


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
import WalletActions from './wallet-actions.js';

const INITIAL_STATE = { balance: 0 };

export default generateReducer(INITIAL_STATE, WalletActions);

```

That's all you need to do, and now your reducer will listen and respond to your actions

### Combining reducer

It works the same as a normal reducer.

`reducers.js`
```javascript
import walletReducer from './wallet-reducer.js';
import { combineReducers } from 'redux';

export default combineReducers({
  wallet: walletReducer,
})
```

`App.js`

```jsx harmony
import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducers from './reducers';
import Wallet from './wallet.js';

const store = createStore(reducers);

ReactDOM.render(
  <Provider store={store}>
    <Wallet />
  </Provider>,
  document.getElementById('root')
);
```

### Triger an action
`wallet.js`
```jsx harmony
import React, { Component } from "react";
import { connect } from "react-redux";
import actions from "./wallet-actions.js";

export class Wallet extends Component {
  render() {
    console.log(actions);
    return (
      <div>
        <div>{this.props.wallet.balance}</div>
        <button onClick={() => this.props.depositAmount(200)}>+200</button>
        <button onClick={() => this.props.withdrawAmount(100)}>-100</button>
        <button onClick={() => this.props.depositAmount(1000000000)}>
          I want to be Billionaire
        </button>
      </div>
    );
  }
}

export default connect(({ wallet }) => ({ wallet }), { ...actions })(Wallet);

