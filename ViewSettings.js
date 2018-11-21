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
  Slider
} from 'react-native-elements'
import MapView, { AnimatedRegion, Animated, Marker } from 'react-native-maps';
import cameraMarkerImg from './cameramarker.png';
import { NativeModules } from 'react-native'
import { DocumentPicker } from 'expo';

import { StackNavigator, SwitchNavigator, NavigationActions } from 'react-navigation';

type Props = {};
export default class ViewSettings extends React.Component {

	showNotificationSoundPicker = async () => {
    let result = await DocumentPicker.getDocumentAsync({type: 'audio/*'});
		if(result.type === 'success') {
			global.alertSoundPath = result.uri;
		}
	}

	savePreferences = () => {
						if(global.circ != null && global.circ2 != null) {
					global.circ.setNativeProps({radius: global.alertDistance});
					global.circ2.setNativeProps({radius: (global.alertDistance+50)*(1.55)});
					
					global.circ.forceUpdate();
					global.circ2.forceUpdate();
					
				}
		if(global.signedIn === true && global.db != null) {
			
			
			global.db.collection("users/" + global.user.uid + "/prefs").doc("settings").set({
				alertDistance: global.alertDistance,
				alertEnabled: global.alertEnabled,
				alertSoundPath: global.alertSoundPath
			})
			.then(function() {

				console.log("Document successfully written!");
			})
			.catch(function(error) {
				console.error("Error writing document: ", error);
			});

		}
	}

  constructor(props) {
    super(props);
	   this.state={checked:global.alertEnabled, value: global.alertDistance};
  }

  render() {

    return(
      <View style={{width: '100%', height: '100%', paddingTop: '6%'}}>
        <View style={styles.navBarLeftButton}>
          <Icon name="notifications" iconStyle={{borderWidth:2, borderColor:"black"}} size={17}/>
          <Text style={styles.buttonText}>Notification settings</Text>
        </View>
        <View style={styles.navBarLeftButtonContent}>
          <CheckBox
            center
            title='Enable notifications'
            checkedIcon='dot-circle-o'
            uncheckedIcon='circle-o'
            checked={this.state.checked}
            onPress={() => {
				this.setState({checked: !this.state.checked}); 
				global.alertEnabled = !global.alertEnabled;
			}
			}
          />
          <Button
            raised
            icon={{name: 'file-audio-o', type:'font-awesome', color:'black'}}
            title="Pick notification sound"
            backgroundColor={"#FAFAFA"}
            color={'black'}
            onPress={this.showNotificationSoundPicker}
			style={{paddingLeft:0, paddingRight:0}}
          />
        </View>
        <View style={styles.navBarLeftButton}>
          <Icon name="gears" type="font-awesome" iconStyle={{borderWidth:2, borderColor:"black"}} size={17}/>
          <Text style={styles.buttonText}>Alert settings</Text>
        </View>
        <View style={styles.navBarLeftButtonContent}>

          <Text>
            Alert me when I'm within...
          </Text>
          <View>
            <Slider
              value={this.state.value}
              minimumValue={5}
              maximumValue={1500}
              step={1}
              onValueChange={(value) => 
					{
						this.setState({value});
						global.alertDistance = value;
					}
			  }
              thumbTintColor={"black"}/>

            <Text>{this.state.value} meters of a detection point</Text>
          </View>
        </View>
		<View style={{ position: 'absolute', bottom: '5%', width:'100%' }}>
		            <Button
              raised
              title="Save & Exit"
              icon={{
                name: "check-circle",
                type: "font-awesome",
                color: "black"
              }}
              backgroundColor={"#FAFAFA"}
              color={"black"}
              onPress={() => {
                this.savePreferences();
				this.props.navigation.navigate("Map");
              }}
              style={{ paddingLeft: 0, paddingRight: 0 }}
            />
		</View>

      </View>
          );
  }
}
const styles = StyleSheet.create({
 navBarLeftButton:{
   flexDirection:'row',

	paddingLeft:'3%',
	
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
 }

});
