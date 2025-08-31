// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlashMessage from 'react-native-flash-message';
import { store, persistor } from 'store/store';
import LoadingScreen from 'components/LoadingScreen';
import BlogListScreen from 'screens/BlogListScreen';
import BlogDetailScreen from 'screens/BlogDetailScreen';

const Stack = createStackNavigator();

const Navigations = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <Stack.Navigator
            initialRouteName="BlogList"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#fff',
                elevation: 2,
                shadowOpacity: 0.1,
              },
              headerTintColor: '#333',
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
              headerBackTitleVisible: false,
            }}
          >
            <Stack.Screen
              name="BlogList"
              component={BlogListScreen}
              options={{
                title: 'Blogs',
                headerStyle: {
                  backgroundColor: '#fff',
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 0,
                },
              }}
            />
            <Stack.Screen
              name="BlogDetail"
              component={BlogDetailScreen}
              options={({ route }) => ({
                title: route.params?.blog?.title || 'Blog Detail',
                headerTitleStyle: {
                  fontSize: 16,
                  fontWeight: '600',
                },
              })}
            />
          </Stack.Navigator>
          <FlashMessage position="top" />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default Navigations;
