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
  Image,
  Dimensions
} from "react-native";
import { Icon, Button } from "react-native-elements";
import { Constants, Notifications, Permissions, Audio } from "expo";
import MapView, {
  AnimatedRegion,
  Animated,
  Marker,
  Callout
} from "react-native-maps";
import cameraMarkerImg from "./cameramarker.png";
import cameraMarkerWarningImg from "./cameramarker-warning.png";
import cameraMarkerAlertImg from "./cameramarker-alert.png";
import { PermissionsAndroid } from "react-native";
import geolib from "geolib";
import ActionButton from "react-native-circular-action-menu";
import ApiKeys from "./ApiKeys.js";
import * as firebase from "firebase";
import Modal_LogView from "./Modal_LogView.js";
require("firebase/firestore");
import Modal from "react-native-modal";

import FlashMessage, {
  showMessage,
  hideMessage
} from "react-native-flash-message";

async function requestLocationPermission() {
  let { status } = await Permissions.askAsync(Permissions.LOCATION);
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "This app needs access to your location"
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the location");
    } else {
      console.log("Location permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
}

async function playAlertSound() {
  if (global.alertSoundPath !== "") {
    soundObject = new Audio.Sound();
    try {
      await this.soundObject.loadAsync({ uri: global.alertSoundPath });
      this.soundObject.playAsync();
    } catch (error) {}
  }
}

type Props = {};

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      position => resolve(position),
      e => reject(e)
    );
  });
};

export default class ViewMap extends React.Component {
  optionsButtonOnClick = () => {
    this.props.navigation.navigate("Settings");
  };

  viewCameraLog = cameraName => {
    if (global.signedIn == true) {
      db.collection("users/" + global.user.uid + "/registers")
        .get()
        .then(querySnapshot => {
          var newList = [];

          querySnapshot.forEach(doc => {
            if (doc.data().camara == cameraName) {
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

  logButtonOnClick = () => {
    if (global.signedIn == true) {
      this.props.navigation.navigate("Log");
    } else {
      this.props.navigation.navigate("Log_Login");
    }
  };

  getImageFor = markerName => {
    //console.log(global.detectedPoints);
    if (
      this.state.loaded == true &&
      global.detectedPoints.includes(markerName)
    ) {
      return cameraMarkerAlertImg;
    } else if (markerName === this.state.nearestPointName) {
      return cameraMarkerWarningImg;
    } else {
      return cameraMarkerImg;
    }
  };

  getMapJsonAsync = () => {
    const copied = {};
    return fetch("http://api.jsonbin.io/b/5b8ff756db948c68635ce769")
      .then(response => response.json())
      .then(responseJson => {
        responseJson.features.map(x => {
          copied[x.properties.direccion] = {
            latitude: x.geometry.coordinates[1],
            longitude: x.geometry.coordinates[0]
          };
        });
        this.setState({
          markers: responseJson.features,
          loaded: true
        });
        global.points = copied;

        //console.log(global.points);
      })
      .catch(error => {
        console.error(error);
      });
  };

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      mapRegion: null,
      lastLat: 0,
      lastLong: 0,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5 * (screenWidth / screenHeight),
      statusBarHeight: 0,
      currentDistance: 0,
      lastTwoPoints: [{ lat: 0, lng: 0, time: 1 }, { lat: 0, lng: 0, time: 0 }],
      nearestPointName: "",
      textEmail: "",
      textPassword: "",
      signedIn: false,
      checkedSignIn: false,
      showLogModal: false,
      currentLogList: {},
      selectedMarkerCoords: { lat: 0, lng: 0 }
    };

    global.detectedPoints = [];
	global.warnedPoints = [];
    //global.detectedPoints = spots;
    //console.log(this.state.detectedPoints["Royal Palace, Oslo"]);
    if (!firebase.apps.length) {
      firebase.initializeApp(ApiKeys.FirebaseConfig);
    }

    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
    global.db = firebase.firestore();
    global.db.settings({
      timestampsInSnapshots: true
    });

    requestLocationPermission();
    this.getMapJsonAsync();
    // Don't call this.setState() here!
    global.signedIn = false;
    global.alertDistance = 60;
    global.alertEnabled = true;
    global.alertSoundPath = "";
  }

  loadPreferences = user => {
    if (global.signedIn == true) {
      var docRef = db
        .collection("users/" + global.user.uid + "/prefs")
        .doc("settings");

      docRef
        .get()
        .then(function(doc) {
          if (doc.exists) {
            console.log("Document data:", doc.data());
            global.alertDistance = doc.data().alertDistance;
            global.alertEnabled = doc.data().alertEnabled;
            global.alertSoundPath = doc.data().alertSoundPath;
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        })
        .catch(function(error) {
          console.log("Error getting document:", error);
        });
    }
  };

  onAuthStateChanged = user => {
    this.setState({ checkedSignIn: true, signedIn: !!user });
    //alert('detected login');
    global.signedIn = !!user;
    global.user = user;

    if (this.state.signedIn == false) {
      //this.props.navigation.navigate('Log_Login');
    } else {
      this.loadPreferences(user);
    }
  };

  componentDidMount() {
    getCurrentLocation().then(position => {
      if (position) {
        region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003
        };

        this.setState({ mapRegion: region });
      }
    });

    this.watchId = navigator.geolocation.watchPosition(
      position => {
        console.log("You can use the location");
        //alert('update')
        // Create the object to update this.state.mapRegion through the onRegionChange function
        let region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: this.state.latitudeDelta,
          longitudeDelta: this.state.longitudeDelta
        };
        if (this._map != null) {
          //this._map.animateToRegion(region, 100);
          this._map.forceUpdate();
        }
        var d = new Date();
        var n = d.getTime();
        if (this.state.lastTwoPoints.length == 0) {
          this.state.lastTwoPoints[0] = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            time: n
          };
        } else if (this.state.lastTwoPoints.length > 0) {
          this.state.lastTwoPoints[1] = this.state.lastTwoPoints[0];
          this.state.lastTwoPoints[0] = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            time: n
          };
        }
        if (this.state.loaded == true && global.points !== null) {
          const nearestPointN = geolib.findNearest(
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
            global.points
          ).key;

          this.setState({ nearestPointName: nearestPointN });
		  
		    global.warnedPoints.forEach(function(p) {
            if (global.points.hasOwnProperty(p)) {
              if (
                global.points[String(p)] !== null &&
                geolib.getDistanceSimple(
                  {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                  },
                  {
                    latitude: global.points[String(p)].latitude,
                    longitude: global.points[String(p)].longitude
                  }
                ) > (global.alertDistance+50)*(1.55)
              ) {
                var index = global.warnedPoints.indexOf(p);
                if (index !== -1) {
                  global.warnedPoints.splice(index, 1);
                }
              }
            }
          });
		  
          global.detectedPoints.forEach(function(p) {
            if (global.points.hasOwnProperty(p)) {
              if (
                global.points[String(p)] !== null &&
                geolib.getDistanceSimple(
                  {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                  },
                  {
                    latitude: global.points[String(p)].latitude,
                    longitude: global.points[String(p)].longitude
                  }
                ) > global.alertDistance
              ) {
                var index = global.detectedPoints.indexOf(p);
                if (index !== -1) {
                  global.detectedPoints.splice(index, 1);
                }
              }
            }
          });
          global.nearestPointData = {
            latitude: global.points[String(nearestPointN)].latitude,
            longitude: global.points[String(nearestPointN)].longitude
          };
		  
		  if (
            geolib.getDistanceSimple(
              {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              },

              global.nearestPointData
            ) <= (global.alertDistance+50)*(1.55)
          ) {
            if (!global.warnedPoints.includes(nearestPointN)) {
              if (global.alertEnabled === true) {
                showMessage({
                  message:
                    "You are about to pass by " +
                    nearestPointN +
                    ". Your current speed is " +
                    geolib.getSpeed(
                      this.state.lastTwoPoints[1],
                      this.state.lastTwoPoints[0]
                    ) +
                    " km/h.",
                  type: "info",
                  icon: { icon: "auto", position: "left" },
                  duration: 10000
                });
                playAlertSound();
              }
              global.warnedPoints.push(nearestPointN);
            }
          }
		  
		  
          if (
            geolib.getDistanceSimple(
              {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              },

              global.nearestPointData
            ) <= global.alertDistance
          ) {
            if (!global.detectedPoints.includes(nearestPointN)) {
              if (global.alertEnabled === true) {
                showMessage({
                  message:
                    "You have passed by " +
                    nearestPointN +
                    " at " +
                    geolib.getSpeed(
                      this.state.lastTwoPoints[1],
                      this.state.lastTwoPoints[0]
                    ) +
                    " km/h!",
                  type: "warning",
                  icon: { icon: "auto", position: "left" },
                  duration: 10000
                });
                playAlertSound();
              }
              global.detectedPoints.push(nearestPointN);
              if (global.user != undefined) {
                global.db
                  .collection("users/" + global.user.uid + "/registers")
                  .add({
                    fecha: new Date().getTime(),
                    camara: nearestPointN,
                    velocidad: geolib.getSpeed(
                      this.state.lastTwoPoints[1],
                      this.state.lastTwoPoints[0]
                    )
                  })
                  .then(function(docRef) {
                    console.log("Document written with ID: ", docRef.id);
                  })
                  .catch(function(error) {
                    console.error("Error adding document: ", error);
                  });
              }
            }
          }
        }
        this.onRegionChange(region, region.latitude, region.longitude);
        //this.setState({lastLat : position.coords.latitude, lastLong: position.coords.longitude});
        /*if (region != undefined && this._map != undefined) {
          this._map.animateToRegion(region, 100);
        }*/
      },
      function(error) {
        //alert("me acabo de delatar a mi mismo");
      },
      {}
    );
  }

  onRegionChange(region, lastLat, lastLong) {
    this.setState({
      //mapRegion: region,
      lastLat: lastLat,
      lastLong: lastLong
    });
  }

  componentWillMount() {
    setTimeout(
      () => this.setState({ statusBarHeight: screenHeight - 74 }),
      500
    );
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchId);
  }

  onPressZoomIn() {
    region = {
      latitude: this.state.lastLat,
      longitude: this.state.lastLong,
      ltDelta: this.state.latitudeDelta * 10,
      lgDelta: this.state.longitudeDelta * 10
    };
    this.setState({
      latitudeDelta: region.ltDelta,
      longitudeDelta: region.lgDelta,
      lastLat: region.latitude,
      lastLong: region.longitude
    });
    this._map.animateToRegion(region, 100);
  }

  onPressZoomOut() {
    region = {
      latitude: this.state.lastLat,
      longitude: this.state.lastLong,
      ltDelta: this.state.latitudeDelta / 10,
      lgDelta: this.state.longitudeDelta / 10
    };
    this.setState({
      latitudeDelta: region.ltDelta,
      longitudeDelta: region.lgDelta,
      lastLat: region.latitude,
      lastLong: region.longitude
    });
    this._map.animateToRegion(region, 100);
    console.log("lt : " + region.ltDelta + " lg : " + region.lgDelta);
  }

  render() {
    if (this.state.loaded == true) {
      return (
        <View style={styles.container}>
          <View style={{ width: "80%", height: "80%" }}>
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
          </View>
          <MapView
            style={styles.map}
            ref={component => {
              this._map = component;
            }}
            showsUserLocation={true}
            followUserLocation={true}
            showsMyLocationButton={true}
            zoomEnabled={true}
            initialRegion={this.state.mapRegion}
            //onRegionChange={this.onRegionChange.bind(this)}
          >
            <MapView.Circle
              ref={circ => {
                global.circ = circ;
              }}
              key={(this.state.lastLong + this.state.lastLat).toString()}
              center={{
                latitude: this.state.lastLat,
                longitude: this.state.lastLong
              }}
              radius={global.alertDistance}
              strokeWidth={1}
              strokeColor={"rgba(75, 134, 200, 1)"}
              fillColor={"rgba(75, 134, 200, 0.29)"}
            />
            <MapView.Circle
              ref={circ2 => {
                global.circ2 = circ2;
              }}
              key={(this.state.lastLong + this.state.lastLat + 2).toString()}
              center={{
                latitude: this.state.lastLat,
                longitude: this.state.lastLong
              }}
              radius={(global.alertDistance + 50) * 1.55}
              strokeWidth={1}
              strokeColor={"rgba(84, 109, 222, 1)"}
              fillColor={"rgba(84, 109, 222, 0.29)"}
            />
            {this.state.markers.map(marker => (
              <Marker
                title={
                  marker.properties.direccion +
                  " (" +
                  geolib.getDistanceSimple(
                    {
                      latitude: this.state.lastLat,
                      longitude: this.state.lastLong
                    },
                    {
                      latitude: parseFloat(marker.geometry.coordinates[1]),
                      longitude: parseFloat(marker.geometry.coordinates[0])
                    }
                  ) +
                  " mts)"
                }
                description={marker.properties.tipo_de_in}
                image={this.getImageFor(marker.properties.direccion)}
                anchor={{ x: 0.5, y: 0.5 }}
                flat={true}
                key={marker.properties.direccion}
                coordinate={{
                  latitude: parseFloat(marker.geometry.coordinates[1]),
                  longitude: parseFloat(marker.geometry.coordinates[0])
                }}
              >
                <Callout
                  onPress={() => {
                    this.viewCameraLog(marker.properties.direccion);
                  }}
                >
                  <View>
                    <Text adjustsFontSizeToFit numberOfLines={1}>
                      {marker.properties.direccion}
                    </Text>
                    <Text
                      style={{ paddingTop: "2%", fontWeight: "bold" }}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                    >
                      Distance:{" "}
                      {geolib.getDistanceSimple(
                        {
                          latitude: this.state.lastLat,
                          longitude: this.state.lastLong
                        },
                        {
                          latitude: parseFloat(marker.geometry.coordinates[1]),
                          longitude: parseFloat(marker.geometry.coordinates[0])
                        }
                      ) + " mts"}
                    </Text>
                    <Text adjustsFontSizeToFit numberOfLines={1}>
                      Detection type:
                      <Text />
                    </Text>
                    <View style={{ width: "90%" }}>
                      <Text
                        style={{ fontSize: 10 }}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                      >
                        {marker.properties.tipo_de_in}
                      </Text>
                    </View>
                    <Button
                      title="View Log"
                      backgroundColor={"#FAFAFA"}
                      color={"black"}
                      onPress={() => {}}
                    />
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
          {/*<TouchableOpacity
            activeOpacity={0.5}
            onPress={this.optionsButtonOnClick}
            style={styles.TouchableOpacityStyle}
          >
            <Image
              source={{ uri: "https://i.imgur.com/PtPCEXs.png" }}
              style={styles.FloatingButtonStyle}
            />
          </TouchableOpacity>*/}

          {/*Rest of App come ABOVE the action button component!*/}
          <ActionButton buttonColor="#606060" radius={80} position="right">
            <ActionButton.Item
              buttonColor="#3C3C3C"
              title="New Task"
              onPress={this.optionsButtonOnClick}
            >
              <Icon name="settings" color={"white"} />
            </ActionButton.Item>
            <ActionButton.Item
              buttonColor="#3C3C3C"
              title="Notifications"
              onPress={this.logButtonOnClick}
            >
              <Icon type="ionicon" name="md-calendar" color={"white"} />
            </ActionButton.Item>
          </ActionButton>
          <FlashMessage position="top" />
          {/* <--- here as last component */}
        </View>
      );
    } else {
      return (
        <View style={styles.loadingView}>
          <Text>Cargando mapa...</Text>
        </View>
      );
    }
  }
}
const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%"
  },
  loadingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  actionButtonIcon: {
    fontSize: 40,
    color: "white"
  },
  TouchableOpacityStyle: {
    position: "absolute",

    right: "6%",
    bottom: "3%"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});
