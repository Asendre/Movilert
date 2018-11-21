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
  View, TextInput,TouchableWithoutFeedback
} from 'react-native';

import {
	Button
} from 'react-native-elements';

import * as firebase from 'firebase';

export default class CreateAccountScreen extends Component<Props> {

  clickCreateAccount = () => {
    firebase.auth().createUserWithEmailAndPassword(this.state.textEmail, this.state.textPassword)
    .then(() => {    this.props.navigation.navigate('Log'); }, (error) => {alert(error.message);});
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

  constructor(props) {
  super(props);
    this.state = { textName: '', textEmail: '', textPassword: ''};
  }
  render() {
    return (

      <View style={styles.container}>
        <View style={styles.top_area}>

          <Text style={styles.top_text}>
            Create a Movilert Account
          </Text>
        </View>

		<View style={styles.middle_area}>
			<View style={{width: '85%', justifyContent: 'center'}}>
			  <TextInput
				style={styles.field_style}
				placeholder={'Name'}
				onChangeText={(text) => this.setState({textName : text})}
			  />
			  <TextInput
				style={styles.field_style}
				placeholder={'Email'}
				onChangeText={(text) => this.setState({textEmail : text})}
			  />
			  <TextInput
				style={styles.field_style}
				secureTextEntry={true}
				placeholder={'Password'}
				onChangeText={(text) => this.setState({textPassword : text})}
			  />

				<Button raised style={{marginTop:'3%'}} title="Create Account" onPress={this.clickCreateAccount} />
			</View>
		</View>



        <View style={styles.bottom_area}>

        </View>
    </View>
    );
  }
}

function  clickButton() {
  alert('You have registered succesfully!')
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
