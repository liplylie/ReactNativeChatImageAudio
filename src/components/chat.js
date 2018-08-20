import React, { Component } from "react";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import { ActionConst, Actions } from "react-native-router-flux";
import {
    View,
    Text,
    Platform,
    PermissionsAndroid,
    Dimensions,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView
} from "react-native";
import { AudioRecorder, AudioUtils } from "react-native-audio";
import PropTypes from "prop-types";
import { RNS3 } from "react-native-aws3";
import Ionicons from "react-native-vector-icons/Ionicons";
import Sound from "react-native-sound";
import { firebaseDB } from "../config/FirebaseConfig";
import NavigationBar from "react-native-navbar";
import AwsConfig from "../config/AwsConfig"

const ImagePicker = require("react-native-image-picker");

class Chat extends Component {
    static PropTypes = {
        viewer: PropTypes.object,
        jobId: PropTypes.string,
        recipientId: PropTypes.string,
        navFromMessageBoard: PropTypes.boolean
    };
    state = {
        messages: [],
        startAudio: false,
        hasPermission: false,
        audioPath: `${
            AudioUtils.DocumentDirectoryPath
            }/${this.messageIdGenerator()}test.aac`,
        playAudio: false,
        fetchChats: false,
        audioSettings: {
            SampleRate: 22050,
            Channels: 1,
            AudioQuality: "Low",
            AudioEncoding: "aac",
            MeteringEnabled: true,
            IncludeBase64: true,
            AudioEncodingBitRate: 32000
        }
    };
    componentWillMount() {
        this.chatsFromFB = firebaseDB.ref(`chat/${this.props.room}`);
        this.chatsFromFB.on("value", snapshot => {
            if (!snapshot.val()) {
                this.setState({
                    fetchChats: true
                });
                return;
            }
            let { messages } = snapshot.val();
            this.setState({
                messages: [...messages]
            });
        });
    }
    componentDidMount() {
        this.checkPermission().then(async hasPermission => {
            this.setState({ hasPermission });
            if (!hasPermission) return;
            await AudioRecorder.prepareRecordingAtPath(
                this.state.audioPath,
                this.state.audioSettings
            );
            AudioRecorder.onProgress = data => {
                console.log(data, "onProgress data");
            };
            AudioRecorder.onFinished = data => {
                console.log(data, "on finish");
            };
        });
    }
    componentWillUnmount() {
        this.setState({
            messages: []
        });
    }

    checkPermission() {
        if (Platform.OS !== "android") {
            return Promise.resolve(true);
        }
        const rationale = {
            title: "Microphone Permission",
            message:
                "AudioExample needs access to your microphone so you can record audio."
        };
        return PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            rationale
        ).then(result => {
            console.log("Permission result:", result);
            return result === true || result === PermissionsAndroid.RESULTS.GRANTED;
        });
    }
    onSend(messages = []) {
        this.chatsFromFB.update({
            messages: [messages[0], ...this.state.messages]
        });
    }
    renderName = props => {
        const { user: self } = this.user; // where your user data is stored;
        const { user = {} } = props.currentMessage;
        const { user: pUser = {} } = props.previousMessage;
        const isSameUser = pUser._id === user._id;
        const isSelf = user._id === self._Id;
        const shouldNotRenderName = isSameUser;
        let firstName = user.name.split(" ")[0];
        let lastName = user.name.split(" ")[1][0];
        return shouldNotRenderName ? (
            <View />
        ) : (
                <View>
                    <Text style={{ color: "grey", padding: 2, alignSelf: "center" }}>
                        {`${firstName} ${lastName}.`}
                    </Text>
                </View>
            );
    };
    renderAudio = props => {
        return !props.currentMessage.audio ? (
            <View />
        ) : (
                <Ionicons
                    name="ios-play"
                    size={Convert(35)}
                    color={this.state.playAudio ? "red" : "blue"}
                    style={{
                        left: 90,
                        position: "relative",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.5,
                        backgroundColor: "transparent"
                    }}
                    onPress={() => {
                        this.setState({
                            playAudio: true
                        });
                        const sound = new Sound(props.currentMessage.audio, "", error => {
                            if (error) {
                                console.log("failed to load the sound", error);
                            }
                            this.setState({ playAudio: false });
                            sound.play(success => {
                                console.log(success, "success play");
                                if (!success) {
                                    Alert.alert("There was an error playing this audio");
                                }
                            });
                        });
                    }}
                />
            );
    };
    renderBubble = props => {
        return (
            <View>
                {this.renderName(props)}
                {this.renderAudio(props)}
                <Bubble {...props} />
            </View>
        );
    };
    handleAvatarPress = props => {
        // add navigation to user's profile
    };
    handleAudio = async () => {
        const { user } = this.props;
        if (!this.state.startAudio) {
            this.setState({
                startAudio: true
            });
            await AudioRecorder.startRecording();
        } else {
            this.setState({ startAudio: false });
            await AudioRecorder.stopRecording();
            const { audioPath } = this.state;
            const fileName = `${this.messageIdGenerator()}.aac`;
            const file = {
                uri: Platform.OS === "ios" ? audioPath : `file://${audioPath}`,
                name: fileName,
                type: `audio/aac`
            };
            const options = {
                keyPrefix: AwsConfig.keyPrefix,
                bucket: AwsConfig.keyPrefix,
                region: AwsConfig.keyPrefix,
                accessKey: AwsConfig.accessKey,
                secretKey: AwsConfig.secretKey,
            };
            RNS3.put(file, options)
                .progress(event => {
                    console.log(`percent: ${event.percent}`);
                })
                .then(response => {
                    console.log(response, "response from rns3 audio");
                    if (response.status !== 201) {
                        alert("Something went wrong, and the audio was not uploaded.");
                        console.error(response.body);
                        return;
                    }
                    const message = {};
                    message._id = this.messageIdGenerator();
                    message.createdAt = Date.now();
                    message.user = {
                        _id: user._id,
                        name: `${user.firstName} ${user.lastName}`,
                        avatar: `user's photo`
                    };
                    message.text = "";
                    message.audio = response.headers.Location;
                    message.messageType = "audio";

                    this.chatsFromFB.update({
                        messages: [message, ...this.state.messages]
                    });
                })
                .catch(err => {
                    console.log(err, "err from audio upload");
                });
        }
    };
    messageIdGenerator() {
        // generates uuid.
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    sendChatToDB(data) {
        // send your chat to your db
    }
    handleAddPicture = () => {
        const { user } = this.props; // wherever you user data is stored;
        const options = {
            title: "Select Profile Pic",
            mediaType: "photo",
            takePhotoButtonTitle: "Take a Photo",
            maxWidth: 256,
            maxHeight: 256,
            allowsEditing: true,
            noData: true
        };
        ImagePicker.showImagePicker(options, response => {
            console.log("Response = ", response);
            if (response.didCancel) {
                // do nothing
            } else if (response.error) {
                // alert error
            } else {
                const { uri } = response;
                const extensionIndex = uri.lastIndexOf(".");
                const extension = uri.slice(extensionIndex + 1);
                const allowedExtensions = ["jpg", "jpeg", "png"];
                const correspondingMime = ["image/jpeg", "image/jpeg", "image/png"];
                const options = {
                    keyPrefix: AwsConfig.keyPrefix,
                    bucket: AwsConfig.keyPrefix,
                    region: AwsConfig.keyPrefix,
                    accessKey: AwsConfig.accessKey,
                    secretKey: AwsConfig.secretKey,
                };
                const file = {
                    uri,
                    name: `${this.messageIdGenerator()}.${extension}`,
                    type: correspondingMime[allowedExtensions.indexOf(extension)]
                };
                RNS3.put(file, options)
                    .progress(event => {
                        console.log(`percent: ${event.percent}`);
                    })
                    .then(response => {
                        console.log(response, "response from rns3");
                        if (response.status !== 201) {
                            alert(
                                "Something went wrong, and the profile pic was     not uploaded."
                            );
                            console.error(response.body);
                            return;
                        }
                        const message = {};
                        message._id = this.messageIdGenerator();
                        message.createdAt = Date.now();
                        message.user = {
                            _id: user._id,
                            name: `${user.firstName} ${user.lastName}`,
                            avatar: "user avatar here"
                        };
                        message.image = response.headers.Location;
                        message.messageType = "image";

                        this.chatsFromFB.update({
                            messages: [message, ...this.state.messages]
                        });
                    });
                if (!allowedExtensions.includes(extension)) {
                    return alert("That file type is not allowed.");
                }
            }
        });
    };
    renderAndroidMicrophone() {
        if (Platform.OS === "android") {
            return (
                <Ionicons
                    name="ios-mic"
                    size={Convert(35)}
                    hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}
                    color={this.state.startAudio ? "red" : "black"}
                    style={{
                        bottom: Convert(50),
                        right: Dimensions.get("window").width / 2,
                        position: "absolute",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.5,
                        zIndex: 2,
                        backgroundColor: "transparent"
                    }}
                    onPress={this.handleAudio}
                />
            );
        }
    }
    renderLoading() {
        if (!this.state.messages.length && !this.state.fetchChats) {
            return (
                <View style={{ marginTop: 100 }}>
                    <ActivityIndicator color="black" animating size="large" />
                </View>
            );
        }
    }


    render() {
        const { user } = this.props; // wherever you user info is
        const rightButtonConfig = {
            title: 'Add photo',
            handler: () => this.handleAddPicture(),
        };
        return (
            <View style={{ flex: 1 }}>
                <NavigationBar
                    title={{ title: "chat" }}
                    rightButton={rightButtonConfig}
                />
                {this.renderLoading()}
                {this.renderAndroidMicrophone()}
                <GiftedChat
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    alwaysShowSend
                    showUserAvatar
                    isAnimated
                    showAvatarForEveryMessage
                    renderBubble={this.renderBubble}
                    messageIdGenerator={this.messageIdGenerator}
                    onPressAvatar={this.handleAvatarPress}
                    renderActions={() => {
                        if (Platform.OS === "ios") {
                            return (
                                <Ionicons
                                    name="ios-mic"
                                    size={Convert(35)}
                                    hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}
                                    color={this.state.startAudio ? "red" : "black"}
                                    style={{
                                        bottom: Convert(50),
                                        right: Dimensions.get("window").width / 2,
                                        position: "absolute",
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.5,
                                        zIndex: 2,
                                        backgroundColor: "transparent"
                                    }}
                                    onPress={this.handleAudio}
                                />
                            );
                        }
                    }}
                    user={{
                        _id: user._id,
                        name: `${user.firstName} ${user.lastName}`,
                        avatar: `Your photo`
                    }}
                />
                <KeyboardAvoidingView />
            </View>
        );
    }
}

export { Chat };
