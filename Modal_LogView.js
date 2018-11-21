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
  Image,

} from 'react-native';
import {
  Icon,
  SearchBar,
  Button,
  CheckBox,
  Slider,
    List, 
  ListItem
} from 'react-native-elements'
import MapView, { AnimatedRegion, Animated, Marker } from 'react-native-maps';
import cameraMarkerImg from './cameramarker.png';
import { NativeModules } from 'react-native'
import { DocumentPicker } from 'expo';
import Modal from "react-native-modal";

type Props = {};
export default class Modal_LogView extends React.Component {

  constructor(props) {
    super(props);
	this.state={list:props.listContent};
	this.state.list.sort(function(a,b){
  // Turn your strings into dates, and then subtract them
  // to get a value that is either negative, positive, or zero.
  return new Date(b.date) - new Date(a.date);
});
  }

  render() {
	if(this.state.list.length == 0) {
		return(
		        <View style={styles.nothingToSeeHereView}>
		<Text style={{color: 'white'}}>Hmm. Nothing to see here!</Text>
        </View>

     
          );
	} else {
    return(
 
        <View style={styles.navBarLeftButton}>
		 <ScrollView>
			<List>
			  {
				
				this.state.list.map((l) => (
				  <ListItem
					key={l.date}
					title={new Date(l.date).toString()}
					subtitle={l.speed + " km/h"}
				    hideChevron
					subtitleStyle={{color: (l.speed > 40) ? 'red' : ''}}
				  />
				))
			  }
			</List>
			 </ScrollView>
        </View>

     
          );
	}
  }
}
const styles = StyleSheet.create({
 navBarLeftButton:{
	 width:"100%",
	 height:"90%",
	
	paddingLeft:'3%',
  paddingTop:'3%',
 },
 navBarLeftButtonContent:{

 paddingLeft:'8%',
 paddingBottom:'1%',
  paddingTop:'1%',
  paddingRight:'5%'
 },

 buttonText: {
   color:'black',
   fontSize: 18,
   paddingLeft:'3%'
 },
  nothingToSeeHereView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});
