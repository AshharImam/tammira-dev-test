import Navigations from 'navigations/index';
import React from 'react';
import 'react-native-gesture-handler';

import { PersistGate } from 'redux-persist/integration/react';

import LoadingScreen from 'components/LoadingScreen';
import { Provider } from 'react-redux';
import { persistor, store } from 'store/store';
const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <Navigations />
      </PersistGate>
    </Provider>
  );
};

export default App;
