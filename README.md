You'll need to create a sensitive.json file in the root directory of the project. This will contain your aws and firebase info

Its structure:
{
    "BUCKET": "",
    "ACCESS_KEY": "",
    "SECRET_KEY": "",
    "APIKEY": "",
    "keyPrefix": "",
    "region": ""
    "authDomain": "",
    "databaseURL": "",
    "projectId": "",
    "storageBucket": "",
    "messagingSenderId": "",
}

You'll need to add permissions:
IOS: xCode info.plist.
Privacy - Microphone Usage Description
Privacy - Photo Library 
Privacy - Camera Usage

Android: 
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO"/>

Names and rooms are case sensitive.

If app crashes when trying to open the photo library:https://github.com/react-community/react-native-image-picker/issues/667