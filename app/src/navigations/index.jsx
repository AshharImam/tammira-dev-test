// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StatusBar } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { useSelector } from 'react-redux';
import BlogDetailScreen from 'screens/BlogDetailScreen';
import BlogListScreen from 'screens/BlogListScreen';
import LoginScreen from 'screens/LoginScreen';
import SignupScreen from 'screens/SignupScreen';

const Stack = createStackNavigator();

const Navigations = () => {
  const token = useSelector(state => state.auth.token);
  console.log(token);
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Navigator
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
        {token ? null : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{
                title: 'Sign Up',
                headerStyle: {
                  backgroundColor: '#fff',
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 0,
                },
              }}
            />
          </>
        )}
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
  );
};

export default Navigations;
