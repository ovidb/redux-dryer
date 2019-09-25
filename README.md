# Redux-dryer

[![Coverage Status](https://coveralls.io/repos/github/ovidb/redux-dryer/badge.svg?branch=next)](https://coveralls.io/github/ovidb/redux-dryer?branch=next)

Keep your redux stores as dry as possible

#### [Demo Playground](https://codesandbox.io/s/64joqv325k)


### Installing

```npm install redux-dryer```

## Usage

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
import { generateReducer } from "redux-dryer";
import WalletActions from "./wallet-actions.js";

const INITIAL_STATE = { balance: 0 };

export default generateReducer(INITIAL_STATE, WalletActions);

```

That's all you need to do, and now your reducer will listen and respond to your actions

### Works with `redux-thunk`

`bitcoin-actions.js`
```javascript

import { generateActions } from "redux-dryer";

const BitcoinActions = {
  fetchedBitcoin: () => {}, // event actions, without payload
  setAmount: (rate, balance) => ({ bitcoins: balance / rate })
};

export default generateActions(BitcoinActions, "bitcoin");
```

`bitcoin-thunks.js`
```javascript
import BitcoinActions from "./bitcoin-actions.js";

const getRate = json =>
  parseInt(json.bpi.USD.rate.split(",").join(""), 10).toFixed(6);

export const toBTC = balance => dispatch => 
  fetch("https://api.coindesk.com/v1/bpi/currentprice.json")
    .then(r => r.json())
    .then(json => {
      dispatch(BitcoinActions.fetchedBitcoin());
      dispatch(BitcoinActions.setAmount(getRate(json), balance)); 
    });
```

`bitcoin-reducer.js`
```
import { generateReducer } from "redux-dryer";
import BitcoinActions from "./bitcoin-actions.js";

const INITIAL_STATE = { bitcoins: 0 };

export default generateReducer(INITIAL_STATE, BitcoinActions);
```

### Combining reducers

`reducers.js`
```javascript
import walletReducer from "./wallet-reducer.js";
import bitcoinReducer from "./bitcoin-reducer.js";
import { combineReducers } from "redux";

export default combineReducers({
  wallet: walletReducer,
  bitcoin: bitcoinReducer
});

```

### The app

`App.js`

```jsx harmony
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import reducers from "./reducers";
import Wallet from "./wallet.js";

const store = createStore(reducers, applyMiddleware(...[thunk, logger]));

ReactDOM.render(
  <Provider store={store}>
    <Wallet />
  </Provider>,
  document.getElementById("root")
);

```

### Triger an action

`wallet.js`
```jsx harmony
import React, { Component } from "react";
import { connect } from "react-redux";
import actions from "./wallet-actions.js";
import * as thunks from "./bitcoin-thunks.js";

export class Wallet extends Component {
  render() {
    
    return (
      <div>
        <div>USD Balance: {this.props.wallet.balance}</div>
        <div>Bitcoin Balance: {this.props.bitcoin.bitcoins}</div>
        <button onClick={() => this.props.depositAmount(200)}>+200</button>
        <button onClick={() => this.props.withdrawAmount(100)}>-100</button>
        <button onClick={() => this.props.depositAmount(1000000000)}>
          I want to be Billionaire
        </button>
        <button onClick={() => this.props.toBTC(this.props.wallet.balance)}>To BTC</button>
      </div>
    );
  }
}

export default connect(({ wallet, bitcoin }) => ({ wallet, bitcoin }), {
  ...actions,
  ...thunks
})(Wallet);

