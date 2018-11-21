/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
  Switch,
  Image
} from "react-native";
import {
  Icon,
  SearchBar,
  Button,
  CheckBox,
  Slider
} from "react-native-elements";
import MapView, { AnimatedRegion, Animated, Marker } from "react-native-maps";
import cameraMarkerImg from "./cameramarker.png";
import { NativeModules } from "react-native";
import { DocumentPicker } from "expo";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import * as firebase from "firebase";
import DateTimePicker from "react-native-modal-datetime-picker";
import Modal_LogView from "./Modal_LogView.js";
import Modal from "react-native-modal";
type Props = {};
export default class ViewLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDateTimePickerVisible: false,
      showLogModal: false,
      currentLogList: {},
    };
  }

  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _handleDatePicked = (date) => {
    console.log("A date has been picked: ", date);
	
    this._hideDateTimePicker();
	
	setTimeout(() => {
		this.viewCameraLog(date);
    }, 500);
   
  };

  viewCameraLog = (date) => {
    if (global.signedIn == true) {
		
      db.collection("users/" + global.user.uid + "/registers")
        .get()
        .then(querySnapshot => {
          var newList = [];
			
          querySnapshot.forEach(doc => {
			  console.log(doc.data());
            var dateDb = new Date(doc.data().fecha);

            if (
              dateDb.getFullYear() === date.getFullYear() &&
              dateDb.getMonth() === date.getMonth() &&
              dateDb.getDay() === date.getDay()
            ) {
              newList.push({
                cameraName: doc.data().camara,
                speed: doc.data().velocidad,
                date: doc.data().fecha
              });
            }
          });

          this.setState({ currentLogList: newList, showLogModal: true });
        });
    } else {
      alert("You must be signed in to use this functionality.");
      this.props.navigation.navigate("Log_Login");
    }
  };

  clickViewByDate = () => {
    this._showDateTimePicker();
  };

  clickViewByCamera = () => {};

  clickLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(
        () => {
          this.props.navigation.navigate("Log_Login");
        },
        error => {
          alert(error.message);
        }
      );
  };

  clickBack = () => {
    this.props.navigation.navigate("Map");
  };
  render() {
    return (
      <View style={{ paddingTop: "6%", width: "100%", height: "100%" }}>
	          <DateTimePicker
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={(date) => {this._handleDatePicked(date)}}
          onCancel={() => {this._hideDateTimePicker()}}
        />
          <Modal
            isVisible={this.state.showLogModal}
            onBackdropPress={() => this.setState({ showLogModal: false })}
          >
            <Modal_LogView listContent={this.state.currentLogList} />
            <Button
              raised
              title="Done"
              icon={{
                name: "check-circle",
                type: "font-awesome",
                color: "#FAFAFA"
              }}
              
              color={"#FAFAFA"}
              onPress={() => {
                this.setState({ showLogModal: false });
              }}
              style={{ paddingLeft: 0, paddingRight: 0 }}
            />
          </Modal>
      
        <View style={styles.navBarLeftButtonContent}>
          <Text>
            We keep track of your passes by detection points, including
            information such as speed, time of passing, etc. This helps you keep
            track of any possible infractions, and helps you build a better
            habit for the future.
          </Text>
        </View>
        <View style={{ width: "100%" }}>
          <View style={styles.navBarLeftButtonContent}>
            <Button
              raised
              icon={{
                name: "md-calendar",
                type: "ionicon",
                color: "black"
              }}
              title="Search by Date"
              backgroundColor={"#FAFAFA"}
              color={"black"}
              onPress={this.clickViewByDate}
              style={{ paddingLeft: 0, paddingRight: 0 }}
            />
          </View>
        </View>
        <View style={{ position: "absolute", bottom: "5%", width: "100%" }}>
          <View style={styles.navBarLeftButtonContent}>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                marginBottom: "3%"
              }}
            >
              <Text style={{ fontWeight: "bold" }}>
                Logged in as:{" "}
                <Text style={{ fontWeight: "normal" }}>
                  {global.user.email}
                </Text>
              </Text>
            </View>
            <Button
              raised
              title="Log out"
              backgroundColor={"#FAFAFA"}
              color={"black"}
              onPress={this.clickLogout}
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

      </View>
    );
  }
}

const styles = StyleSheet.create({
  navBarLeftButton: {
    flexDirection: "row",
    flexGrow: 1,
    paddingLeft: "3%",
    paddingTop: "3%",
    width: "100%"
  },
  navBarLeftButtonContent: {
    paddingLeft: "8%",
    paddingBottom: "1%",
    paddingTop: "1%",
    paddingRight: "5%"
  },

  buttonText: {
    color: "black",
    fontSize: 18,
    paddingLeft: "3%"
  }
});
