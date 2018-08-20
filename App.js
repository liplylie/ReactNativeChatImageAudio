import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActionConst, Actions, Router, Scene } from "react-native-router-flux";
import enterRoom from "./src/components/enterRoom";
//import chat from "./src/components/chat";

export default class App extends React.Component {
  render() {
    return (
      <Router>
        <Scene key={"ROOT_SCENE"} panHandlers={null} passProps>
          <Scene
            key={"enterRoom"}
            component={enterRoom}
            type={ActionConst.RESET}
          />
          {/* <Scene
            key={"chat"}
            component={chat}
            type={ActionConst.RESET}
          /> */}
        </Scene>
      </Router>
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
