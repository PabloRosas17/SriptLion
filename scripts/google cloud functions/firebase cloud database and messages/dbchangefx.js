/* eslint-disable promise/no-nesting */

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const firebase = require('firebase-admin');
firebase.initializeApp();

// Generate a function that will take some children data in a database and cloud messages send to devices.
// DEVICE TOKEN is something like this cp7yI73872...U314I73874738HHJDHFJEF8 you generate this from your clients device.
// -M4HFzML8DynifurhEf2 is an id token in one of my reference database, you need to change it to your needs.
// mLat is a child of it's parent key, it contains a double parsed as a string.
// mLng is a child of it's parent key, it contains a double parsed as a string.
// mName is a child of it's parent key, it contains a string parsed as a string.
exports.dbchangefx = functions.database
.ref('/YOUR-DATABASE-NAME/{accountId}/')
.onUpdate((change,context) => {
    //Grab values for previous,current,timestamps,timenow, then log them.
    const before = change.before.val()
    const after = change.after.val()
    const timestamp = context.timestamp.toString()
    const timenow = Date.now()

    //query account, retrieve lat,lng,name, prepare paylod by setup message
    return firebase.database().ref('/YOUR-DATABASE-NAME/-M4HFzML8DynifurhEf2/mLat')
        .once('value').then((mLat) => {
            console.log(mLat.val())
            return firebase.database().ref('/YOUR-DATABASE-NAME/-M4HFzML8DynifurhEf2/mLng')
                .once('value').then((mLng) => {
                    console.log(mLng.val())
                    return firebase.database().ref('/YOUR-DATABASE-NAME/-M4HFzML8DynifurhEf2/mName')
                        .once('value').then((mName) => {
                            console.log(mName.val())
                            const message = {
                                data: {
                                    mA: change.after.ref.child('mLat').root.toString()
                                    , mB: change.after.ref.child('mLat').path.toString()
                                    , mC: change.after.ref.child('mLat').toJSON().toString()
                                    , mD: change.after.ref.child('mLat').ref.toJSON().toString()
                                    , mE: change.after.ref.child('mLat').toString()
                                    , mLat: mLat.toJSON().toString()
                                    , mLng: mLng.toJSON().toString()
                                    , mName: mName.toJSON().toString()
                                }
                            };
                            // Some debug is always good.
                            console.log('lat: ' + mLat.toString() + ' lng: ' + mLng.toString() + ' name: ' + mName.toString())
                            console.log('after: ' + after)
                            console.log('before: ' + before)
                            console.log('timestamp: ' + timestamp)
                            console.log('timenow: ' + timenow)
                            console.log('message: ' + message)

                            //Prepare device token(s).
                            const token = 'DEVICE_TOKEN';

                            return firebase.messaging().sendToDevice(token, message)
                                .then((response) => {
                                    return console.log('Successfully sent message:', response);
                                })
                                .catch((error) => {
                                    return console.log('Error sending message:', error);
                                });//[END SENDTODEVICE]
                        });//[END MNAME]
                });//[END MLNG]
        });//[END MLAT]
}); //[END DBCHANGEFX]