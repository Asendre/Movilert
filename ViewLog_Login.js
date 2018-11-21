/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View, TextInput, TouchableWithoutFeedback
} from 'react-native';

import {
	Button
} from 'react-native-elements';
import ApiKeys from './ApiKeys.js';
import * as firebase from 'firebase';


export default class LoginScreen extends Component<Props> {


  clickCreateAccount = () => {
    this.props.navigation.navigate('CreateAccountScreen');
  }
  clickBack = () => {
    this.props.navigation.navigate("Map");
  };

  checkLogin = () => {
	  

    //const userToken = await AsyncStorage.getItem('currentUser');

    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
    //this.props.navigation.navigate(userToken ?  'HomeScreen': 'AccountManagementStack');
  };
  clickButton = () => {

    /*getValueFromKey("userDB-" + this.state.textEmail).then((value) => {
      if(value.password != this.state.textPassword) {
        alert('Incorrect email or password.')
      } else {
        setValueOnKey("currentUser", value).then(() => {
          alert('Welcome, ' + value.name + '!')
          this.props.navigation.navigate('HomeScreen');
        }).catch(err => {
          alert(err)
        })
      }
    }).catch(err => {
      alert('Incorrect email or password.')
    })*/
  }
  clickLogin = () => {
    firebase.auth().signInWithEmailAndPassword(this.state.textEmail, this.state.textPassword)
    .then(() => {
			global.user = firebase.auth().currentUser;
			this.props.navigation.navigate('Log'); 
		}, (error) => {alert(error.message);});
    /*var newUser = {name:this.state.textName, email:this.state.textEmail, password:this.state.textPassword};
    getValueFromKey("userDB-" + this.state.textEmail).then((value) => {
      alert('There is another user already registered by this email. Please delete the account on this email and try again.')
    }).catch(err => {
      setValueOnKey("userDB-" + this.state.textEmail, newUser).then(() => {
        setValueOnKey("currentUser", newUser).then(() => {
          alert('You have created your account!')
          this.props.navigation.navigate('HomeScreen');
        }).catch(err => {
          alert(err)
        })
      }).catch(err => alert(err))
    })*/

  }

  clickNeedHelp = () => {
    alert('You are pasandola horrible!')
  }
  constructor(props) {
    super(props);
	
	this.state = {
		textEmail : '',
		textPassword : '',
	};
	
    this.checkLogin();

  }

  // Fetch the token from storage then navigate to our appropriate place


  render() {
    return (

      <View style={styles.container, {paddingTop:"5%"}}>
        <View style={styles.top_area}>

          <Text style={styles.top_text}>
            Sign in
          </Text>
        </View>

        <View style={styles.middle_area}>
         

          <View style={{width: '85%', justifyContent: 'center'}}>
			  <View>
				  <TextInput
					style={styles.field_style}
					placeholder={'Email'}
					onChangeText={(text) => this.setState({textEmail : text})}
				  />
				  <TextInput
					secureTextEntry={true}
					style={styles.field_style}
					placeholder={'Password'}
					onChangeText={(text) => this.setState({textPassword : text})}

				  />
				  <View style={{marginTop: '3%'}}>
				  <Button
					raised

					onPress={this.clickLogin}
					title="Sign In"
					marginTop="10%"
					accessibilityLabel
					="Sign in"
				  />
				</View>
			  </View>
			  {/*<LoginBox navigation = {this.props.navigation}></LoginBox>*/}
          </View>
        </View>


        <View style={styles.bottom_area}>
		    <Button
              raised
              title="Create an account"
              backgroundColor={"#FAFAFA"}
              color={"black"}
              onPress={this.clickCreateAccount}
            />
            <Button
              raised
              title="Back"
              backgroundColor={"#FAFAFA"}
              color={"black"}
              onPress={this.clickBack}
            />
        </View>
    </View>
    );
  }
}




const styles = StyleSheet.create({
  field_style: {
    height: 40,
    borderColor: 'gray',
    backgroundColor: 'white',
    borderWidth: 1,
  },
  top_area: {
    width: '100%',
    height: '10%',
  },

  middle_area: {
    width: '100%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgray',
  },



  bottom_area: {
    width: '100%',
    height: '20%',
    backgroundColor: 'lightgray',
  },

  container: {
	width: '100%',
	height: '100%',
	justifyContent: 'center',
    alignItems: 'center',
  },
  top_text: {
    fontSize: 18,
    textAlign: 'center',
    color: 'rgb(10, 10, 10)',
    fontWeight: 'bold',
    margin: 10,
  },

  middle_text: {
    fontSize: 16,
    textAlign: 'center',
    color: 'rgb(10, 10, 10)',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
