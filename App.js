import React from 'react';
// import the screens
import Chat from './components/Chat';
import Start from './components/Start';
import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
//import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

//const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default class App extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Start"
        >
        
          <Tab.Screen
            name="Start"
            component={Start}
          />

<Tab.Screen
            name="Chat"
            component={Chat}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}