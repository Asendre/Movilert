/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
  Switch,
  Button,
  Image,

} from 'react-native';
import MapView, { AnimatedRegion, Animated, Marker } from 'react-native-maps';
import cameraMarkerImg from './cameramarker.png';

import Icon from 'react-native-elements';

import ViewMap from './ViewMap';
import ViewSettings from './ViewSettings';
import ViewLog from './ViewLog';
import ViewLog_Login from './ViewLog_Login';
import CreateAccountScreen from './CreateAccountScreen.js';

import { StackNavigator, SwitchNavigator, NavigationActions } from 'react-navigation';
	console.disableYellowBox = true;
type Props = {};
export class App extends React.Component {

  constructor(props) {
    super(props);
 
  }
}
const MainAppStack = StackNavigator(
{
  Map: {
    screen: ViewMap,
    navigationOptions: {
      header: null,
    }
  },
  Settings: {
    screen: ViewSettings,
    navigationOptions: { 
          title: 'Settings',
		  header: null,
    }
  },
  Log: {
    screen: ViewLog,
    navigationOptions: {
          title: 'Detection Report',
          header: null,
    }
  },
  Log_Login: {
    screen: ViewLog_Login,
    navigationOptions: {
          title: 'Log in',
		  header: null,
    }
  },
  CreateAccountScreen: {
    screen: CreateAccountScreen,
    navigationOptions: {
          title: 'Register',
    }
  }
}
);

export default SwitchNavigator(
{
  MainAppStack: MainAppStack,
},
{
  initialRouteName: 'MainAppStack',
}
);
