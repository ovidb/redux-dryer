# Redux-dryer

[![Coverage Status](https://coveralls.io/repos/github/ovidb/redux-dryer/badge.svg?branch=next)](https://coveralls.io/github/ovidb/redux-dryer?branch=master)

This library uses the strategy pattern and removes the boilerplate from your workflow. 

### What do I mean by that?

Instead of having to write a lot of boilerplate code you basically only have to define your reducers (strategies)
for updating your store.
 
The actions are automatically generated for you by the library when you initialize the reducer.  

The library also uses [Immer](https://github.com/immerjs/immer), which makes state updates cleaner and easier to reason 
about because you can mutate the objects directly instead of having the spread them. 

#### [Demo Playground](https://codesandbox.io/s/redux-dryernext-89vvc)

### Installing

`npm install @ovidb/redux-dryer`

## Usage

### Generating actions creators and reducer

`wallet-dryer.ts`

```typescript
import { ActionPayload as AP, reduxDryer } from 'redux-dryer';

interface WalletState {
  balance: number;
  btc: number;
  loading: boolean;
}

const initialState: WalletState = {
  loading: false,
  balance: 0,
  btc: 0,
};

export type Payloads = {
  SetBalance: number;
  Amount: number;
  SetBTCRate: number;
  Loading: boolean;
};

const { reducer: walletReducer, actions } = reduxDryer({
  initialState,
  namespace: 'wallet',
  reducers: {
    // the name of the action will become the action type
    setBalance: (state, action: AP<Payloads['SetBalance']>) => {
      // Even though this looks like we are mutating we are not because
      // we can update state directly with [Immer](https://github.com/immerjs/immer)
      state.balance = action.payload;
    },
    depositAmount: (state, action: AP<Payloads['Amount']>) => {
      state.balance += action.payload;
    },
    withdrawAmount: (state, action: AP<Payloads['Amount']>) => {
      state.balance -= action.payload;
    },
    convertToBTC: (state, action: AP<Payloads['SetBTCRate']>) => {
      state.btc = state.balance / action.payload;
    },
    setIsLoading: (state, action: AP<Payloads['Loading']>) => {
      state.loading = action.payload;
    },
  },
});

export { walletReducer, actions };
```

### Works with `redux-thunk`

`bitcoin-thunks.ts`

```typescript
import { actions } from './wallet-dryer';
import { AppState } from './reducers';
import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';

export interface CoinDeskCurrentPriceResponse {
  bpi: { USD: { rate: string } };
}

const getRate = (json: CoinDeskCurrentPriceResponse) =>
  parseFloat(parseInt(json.bpi.USD.rate.split(',').join(''), 10).toFixed(6));

export const toBTC = (): ThunkAction<
  Promise<>,
  AppState,
  number,
  Action<string>
> => async (dispatch, getState) => {
  dispatch(actions.setIsLoading(true));
  fetch('https://api.coindesk.com/v1/bpi/currentprice.json')
    .then(r => r.json())
    .then(json => {
      dispatch(actions.setIsLoading(false));
      dispatch(actions.convertToBTC(getRate(json)));
    });
};
```

### Adding the reducer to root reducer

`root-reducer.ts`

```typescript
import { combineReducers } from 'redux';
import { walletReducer } from './wallet-dryer';

const rootReducer = combineReducers({
  wallet: walletReducer,
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
```

That's all you need to do, and now your reducer will listen and respond to your actions

### The app

`App.tsx`

```typescript jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer from './root-reducer';
import Wallet from './wallet-connected';

const store = createStore(reducers, applyMiddleware(...[thunk, logger]));

ReactDOM.render(
  <Provider store={store}>
    <Wallet />
  </Provider>,
  document.getElementById('root')
);
```

### Trigger an action

`wallet.tsx`

```typescript jsx
import React from 'react';
import { connect } from 'react-redux';
import { actions, WalletState } from './wallet-dryer';
import { fetchBTCRate } from './bitcoin-thunks';
import { AppState } from './reducers';

const mapStateToProps = ({ wallet }: AppState) => ({
  ...wallet,
});

const mapDispatchToProps = {};

interface Wallet {
  loading: boolean;
  balance: number;
  btc: number;
  actions: ReturnType;
}

export const Wallet: FC<Wallet> = ({ balance, loading, btc, ...actions }) => {
  return (
    <div>
      <div>USD Balance: {balance}</div>
      <div>Bitcoin Balance: {btc}</div>
      <button onClick={() => actions.depositAmount(200)}>+200</button>
      <button onClick={() => actions.withdrawAmount(100)}>-100</button>
      <button onClick={() => actions.setBalance(10000000000)}>
        I want to be Billionaire
      </button>
      <button onClick={() => actions.toBTC(balance)}>To BTC</button>
      {loading && 'Loading...'}
    </div>
  );
};

export default connect(
  ({ wallet, bitcoin }) => ({ wallet, bitcoin }),
  {
    ...actions,
    ...thunks,
  }
)(Wallet);
```
