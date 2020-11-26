/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    Image,
    Button,
    TextInput
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';

import HMSLocation from '@hmscore/react-native-hms-location';

const App =() => {

  useEffect(() => {
    HMSLocation.LocationKit.Native.init()
        .then(_ => console.log("Done loading"))
        .catch(ex => console.log("Error while initializing." + ex));
}, []);

  return (
    <>
    <SafeAreaView>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
          <View style={styles.body}>

            <Permissions />
            <View style={styles.divider} />
            <ActivityIdentification/>
            <View style={styles.divider} />

          </View>

          

        </ScrollView>
      </SafeAreaView>
      
      
    </>
  );
};


const Permissions = () => {
  const [hasActivityIdentificationPermission, setHasActivityIdentificationPermission] = useState(false);

  useEffect(() => {
      // Check ActivityIdentification permissions
      HMSLocation.ActivityIdentification.Native.hasPermission()
          .then(result => setHasActivityIdentificationPermission(result))
          .catch(ex => console.log("Error while getting activity identification permission info: " + ex));
  }, []);


  const requestActivityIdentificationPermisson = useCallback(() => {
      HMSLocation.ActivityIdentification.Native.requestPermission();
  }, []);

  return (
      <>
        <View style={styles.sectionContainer}>
          <View style={styles.spaceBetweenRow}>
            <Text style={styles.sectionTitle}>Permissions</Text>
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <View >
            <Text style={styles.sectionTitle}>ActivityIdentification</Text>
            <View  style={styles.buttonSection}>
              <Button
                title="Request Permission"
                onPress={requestActivityIdentificationPermisson}
                />
            </View>
            
          </View>
          <View style={styles.spaceBetweenRow}>
            <Text style={styles.monospaced}>{JSON.stringify(hasActivityIdentificationPermission, null, 2)}</Text>
          </View>
        </View>
      </>
  )
};


const ActivityIdentification = () => {
  const [idReqCode, setIdReqCode] = useState();

  const [identificationSubscribed, setIdentificationSubscribed] = useState(false);

  const [identificationResponse, setIdentificationResponse] = useState();

  const [mostActivity, setMostActivity] = useState();


  const dataMap = [
    { name: 'Vehicle', value: HMSLocation.ActivityIdentification.Activities.VEHICLE },
    { name: 'Bike', value: HMSLocation.ActivityIdentification.Activities.BIKE },
    { name: 'Foot', value: HMSLocation.ActivityIdentification.Activities.FOOT },
    { name: 'Running', value: HMSLocation.ActivityIdentification.Activities.RUNNING },
    { name: 'Still', value: HMSLocation.ActivityIdentification.Activities.STILL },
    { name: 'Tilting', value: HMSLocation.ActivityIdentification.Activities.TILTING  },
    { name: 'Others', value: HMSLocation.ActivityIdentification.Activities.OTHERS },
    { name: 'Walking', value: HMSLocation.ActivityIdentification.Activities.WALKING },
  ]

  // Activity Identification
  const createActivityIdentification = useCallback(() => {
      HMSLocation.ActivityIdentification.Native.createActivityIdentificationUpdates(2000)
          .then(res => {
              console.log(res);
              setIdReqCode(res.requestCode);
          })
          .catch(err => console.log('ERROR: Activity identification failed', err));
  }, []);
  const removeActivityIdentification = useCallback(idReqCode => {
      HMSLocation.ActivityIdentification.Native.deleteActivityIdentificationUpdates(idReqCode)
          .then(res => {
              console.log(res);
              setIdReqCode(null);
          })
          .catch(err => console.log('ERROR: Activity identification deletion failed', err));
  }, []);

  const handleActivityIdentification = useCallback(act => {
      console.log('ACTIVITY : ', act);
      setIdentificationResponse(act);
      const mostActivity = dataMap.filter( item => item.value === act.mostActivityIdentification.identificationActivity)[0]
  
      console.log('mostActivity : ', mostActivity);
      setMostActivity(mostActivity) 
  }, []);

  const addActivityIdentificationEventListener = useCallback(() => {
      HMSLocation.ActivityIdentification.Events.addActivityIdentificationEventListener(
          handleActivityIdentification,
      );
      setIdentificationSubscribed(true);
  }, []);

  const removeActivityIdentificationEventListener = useCallback(() => {
      HMSLocation.ActivityIdentification.Events.removeActivityIdentificationEventListener(
          handleActivityIdentification,
      );
      setIdentificationSubscribed(false);
  }, []);

  return (
      <>
        <View style={styles.sectionContainer}>
          <View style={styles.spaceBetweenRow}>
            <Text style={styles.sectionTitle}>Activity Identification</Text>
          </View>
          <View style={styles.centralizeContent}>
            <View style={styles.btnSpace}>
              <Button
                title={
                    idReqCode ?
                        "Remove Identification" :
                        "Get Identification"
                }
                onPress={() => {
                    if (idReqCode) {
                        removeActivityIdentification(idReqCode)
                    } else {
                        createActivityIdentification(2000)
                    }
                }} />
            </View>
            
              <Button
                title={identificationSubscribed ? "Unsubscribe" : "Subscribe"}
                onPress={() => {
                    if (identificationSubscribed) {
                        removeActivityIdentificationEventListener()
                    } else {
                        addActivityIdentificationEventListener()
                    }
                }} />
          </View>
          <View style={styles.spaceBetweenRow}>
            <Text style={styles.sectionDescription}>
              <Text style={styles.boldText}>Activity Request Code</Text>:{' '}
              {`${idReqCode || ''}`}
            </Text>
          </View>
          <View style={styles.spaceBetweenRow}>
            <Text style={styles.monospaced}>
              {JSON.stringify(identificationResponse, null, 2)}
            </Text>
          </View>
          <View style={styles.spaceBetweenRow}>
            
            { identificationResponse &&
            <>
              <Text style={styles.monospaced}>
                Most actitivy data:
              </Text>
                <Text style={styles.monospaced}>
                    {`Posibility: ${identificationResponse.mostActivityIdentification.possibility}`}
                </Text>
                
            </>
            }
          </View>
          { identificationResponse &&
          <View style={styles.activityContainer}>
            <Text style={styles.statusText}>Status</Text>
            <View style={styles.activityCard}>
                    <Text style={styles.textCenter}>
                      {mostActivity && mostActivity.name}
                    </Text>
              </View>
          </View>
          }
           
         
        </View>
      </>
  );
}




const styles = StyleSheet.create({

  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
      position: 'absolute',
      right: 0,
  },
  body: {
      backgroundColor: Colors.white,
  },
  sectionContainer: {
      marginTop: 32,
      paddingHorizontal: 24,
  },
  sectionTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: Colors.black,
  },
  sectionDescription: {
      marginTop: 8,
      fontSize: 18,
      fontWeight: '400',
      color: Colors.dark,
  },
  activityData: {
      marginTop: 8,
      marginLeft: 5,
      fontSize: 16,
      fontWeight: '400',
      color: Colors.dark,
  },
  highlight: {
      fontWeight: '700',
  },
  footer: {
      color: Colors.dark,
      fontSize: 12,
      fontWeight: '600',
      padding: 4,
      paddingRight: 12,
      textAlign: 'right',
  },
  header: {
      height: 180,
      width: '100%',
  },
  headerTitleWrapper: {
      position: 'absolute',
      justifyContent: 'center',
      top: 0,
      bottom: 0,
      right: 0,
      left: 20,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#5FD8FF' },
  headerLogoWrapper: { alignItems: 'flex-end', justifyContent: 'center' },
  headerLogo: { height: 200, width: 200 },
  spaceBetweenRow: { flexDirection: 'row', justifyContent: 'space-between' , marginTop: 10},
  divider: {
      width: '90%',
      alignSelf: 'center',
      height: 1,
      backgroundColor: 'grey',
      marginTop: 20,
  },
  boldText: { fontWeight: 'bold' },
  centralizeSelf: { alignSelf: 'center' },
  centralizeContent: { flexDirection: 'row', justifyContent: 'center' },
  monospaced: { fontFamily: 'monospace' },

  buttonSection: {
    width: '100%',

    justifyContent: 'center',
    alignItems: 'center'
  },

  btnSpace: {
    marginRight: 5
  },
  textCenter:{
    textAlign: 'center', 
    fontSize: 30,
    color: 'white',
  
    paddingVertical: 20,
    paddingHorizontal: 20
  },
  activityCard:{
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor: '#2167f3',
    width: '50%',
    borderRadius: 10,
    marginTop: 10
  },

  activityContainer:{
    alignItems: 'center',
    marginTop: 20
  },
  statusText:{
    fontWeight: '700'
  },
  activityDes:{
    marginTop: 10
  }


});

export default App;
