import React, { Component } from "react";
import { StyleSheet, Text, View, TextInput, TouchableHighlight } from "react-native";
import { ActionConst, Actions, Router, Scene } from "react-native-router-flux";
import AwsConfig from "../config/AwsConfig";


export default class enterRoom extends Component {
    constructor(props) {
        super(props)
        this.state = {
            firstName: "",
            lastName: "",
            roomName: "",
            enterRoom: false
        }
        this.onSubmitEdit = this.onSubmitEdit.bind(this);
        this.enterRoom = this.enterRoom.bind(this);
    }
    componentDidMount() {
        console.log(AwsConfig, "aws config")
    }

    onSubmitEdit() {
        console.log(this.state.text)
        const { firstName, lastName } = this.state
        if (firstName && lastName) {
            this.setState({ enterRoom })
        } else {
            alert("please enter your name")
        }
    }

    enterRoom() {
        console.log(this.state, "state")
        const { firstName, lastName, roomName } = this.state
        const user = {
            id: `${firstName}${lastName}`,
            name: `${firstName}${lastName}`,
            firstName: firstName,
            lastName: lastName,
            roomName: roomName,
            avatar: `https://upload.wikimedia.org/wikipedia/commons/9/93/Default_profile_picture_%28male%29_on_Facebook.jpg`
        }
    }
    render() {
        if (this.state.enterRoom) {
            return (
                <View style={styles.container}>
                    <Text> enter the name of the room </Text>
                    <TextInput
                        style={{ height: 40, width: 200, borderColor: 'gray', borderWidth: 1 }}
                        onChangeText={(text) => this.setState({ roomName: text })}
                        placeholder="room name"
                    />
                    <TouchableHighlight onPress={this.enterRoom}>
                        <Text>Press this button to enter the chat room</Text>
                    </TouchableHighlight>
                </View>
            );
        }
        return (
            <View style={styles.container}>
                <Text> Enter Your Name </Text>
                <TextInput
                    style={{ height: 40, width: 200, borderColor: 'gray', borderWidth: 1 }}
                    onChangeText={(text) => this.setState({ firstName: text.trim() })}
                    placeholder="first name"
                />
                <TextInput
                    style={{ height: 40, width: 200, borderColor: 'gray', borderWidth: 1 }}
                    onChangeText={(text) => this.setState({ lastName: text.trim() })}
                    placeholder="last name"
                />
                <TouchableHighlight onPress={this.onSubmitEdit}>
                    <Text>Press when finished</Text>
                </TouchableHighlight>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    }
});
