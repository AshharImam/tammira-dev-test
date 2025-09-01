// App.js
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import assets from 'assets/index';
import React, { useCallback, useEffect } from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { useDispatch, useSelector } from 'react-redux';
import BlogDetailScreen from 'screens/BlogDetailScreen';
import BlogEditorScreen from 'screens/BlogEditorScreen';
import BlogListScreen from 'screens/BlogListScreen';
import LoginScreen from 'screens/LoginScreen';
import ProfileScreen from 'screens/ProfileEditScreen';
import SignupScreen from 'screens/SignupScreen';
import colors from 'src/styles/colors';
import { getProfile } from 'store/authSlice';

const Stack = createStackNavigator();

const Navigations = () => {
  const token = useSelector(state => state.auth.token);
  const dispatch = useDispatch();
  useEffect(() => {
    if (token) {
      dispatch(getProfile());
    }
  }, [token]);

  const renderHeaderRight = useCallback(() => <HeaderRight />, []);

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
            headerRight: renderHeaderRight,
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
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Profile',
          }}
        />
        <Stack.Screen
          name="BlogEditorScreen"
          component={BlogEditorScreen}
          options={{
            title: 'Blog Editor',
          }}
        />
      </Stack.Navigator>
      <FlashMessage position="top" />
    </NavigationContainer>
  );
};

const HeaderRight = () => {
  const token = useSelector(state => state.auth.token);
  const navigation = useNavigation();
  if (!token) {
    return (
      <TouchableOpacity
        style={styles.headerRightContainer}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginSignupText}>Login/Sign Up</Text>
      </TouchableOpacity>
    );
  }
  return (
    <View style={styles.headerRightContainer}>
      <TouchableOpacity
        onPress={() => navigation.navigate('BlogEditorScreen')}
        style={[styles.headerButton, styles.plusIconContainer]}
      >
        <Image source={assets.Plus} style={styles.plusIcon} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Profile')}
        style={styles.headerButton}
      >
        <Image source={assets.ProfileUser} style={styles.userIcon} />
      </TouchableOpacity>
    </View>
  );
};

export default Navigations;

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 26,
  },
  headerButton: {
    marginLeft: 15,
  },
  plusIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  userIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  loginSignupText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
