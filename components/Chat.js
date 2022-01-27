import React from 'react';
import { View, Platform, KeyboardAvoidingView, Text, Button, TextInput, LogBox  } from 'react-native';
import { GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import firebase from 'firebase';
import 'firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from "./CustomActions";
import MapView from 'react-native-maps';



export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
      isConnected: false,
      image: null,
      location: null
    };

    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyAySX2NnTetL0rqZIPGdT_oOvHHBLBP428",
  authDomain: "chatapp-569e0.firebaseapp.com",
  projectId: "chatapp-569e0",
  storageBucket: "chatapp-569e0.appspot.com",
  messagingSenderId: "958550589874",
  appId: "1:958550589874:web:d2a2f1426392369a4864ab"
      });
    }
    this.referenceChatMessages = firebase.firestore().collection("messages");
    LogBox.ignoreLogs([
      'Setting a timer',
      'Warning: ...',
      'undefined',
      'Animated.event now requires a second argument for options',]);
  }

  // when updated set the messages state with the current data 
  onCollectionUpdate = (querySnapshot) => { 
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
        // get the QueryDocumentSnapshot's data
        let data = doc.data();
        messages.push({
            _id: data._id,
            text: data.text,
            createdAt: data.createdAt.toDate(),
            user: {
                _id: data.user._id,
                name: data.user.name,
                avatar: data.user.avatar
            },
            image: data.image || null,
            location: data.location || null,
        });
    });
    this.setState({
        messages: messages
    });
};

getMessages = async () => {
  let messages = '';
  try {
    messages = await AsyncStorage.getItem('messages') || [];
    this.setState({
      messages: JSON.parse(messages)
    });
  } catch (error) {
    console.log(error.message);
  }
};


renderInputToolbar = (props) => {
  if (this.state.isConnected == false) {
  } else {
    return <InputToolbar {...props} />;
  }
}

  componentDidMount() {
    this.getMessages();
    // Set the page title once Chat is loaded
    let { name } = this.props.route.params
    // Adds the name to top of screen
    this.props.navigation.setOptions({ title: name })

    //To find out user's connection status
    NetInfo.fetch().then(connection => {
        //actions when user is online
        if (connection.isConnected) {
            this.setState({ isConnected: true });
            console.log('online');
        

        
            // user can sign in anonymously
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
            if (!user) {
                await firebase.auth().signInAnonymously();
            }
            //update user state with currently active user data
            this.setState({
              uid: user.uid,
              messages: [],
              user: {
                  _id: user.uid,
                  name: name,
                  avatar: "https://placeimg.com/140/140/any",
              },
          });
          // listens for updates in the collection
          this.unsubscribe = this.referenceChatMessages
          .orderBy("createdAt", "desc")
          .onSnapshot(this.onCollectionUpdate)
          //referencing messages of current user
          this.refMsgsUser = firebase
          .firestore()
          .collection("messages")
          .where("uid", "==", this.state.uid);
          });
         

      } else {
           this.setState({ isConnected: false });
        this.getMessages();
      }   
  });
}

  

componentWillUnmount() {
  this.authUnsubscribe();
  
}

 onSend(messages = []) {
  this.setState(previousState => ({
    messages: GiftedChat.append(previousState.messages, messages),
  }), () => {
    this.addMessage();
    this.saveMessages();
  });
}

saveMessages = async () => {
  try {
    await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
  } catch (error) {
    console.log(error.message);
  }
}

async deleteMessages() {
  try {
    await AsyncStorage.removeItem('messages');
    this.setState({
      messages: []
    })
  } catch (error) {
    console.log(error.message);
  }
}

onCollectionUpdate = (querySnapshot) => {
  const messages = [];
  // through each document
  querySnapshot.forEach((doc) => {
    let data = doc.data();
    messages.push({
      _id: data._id,
      text: data.text || "",
      createdAt: data.createdAt.toDate(),
      user: data.user,
      image: data.image || null,
      location: data.location || null
    });
  });
  this.setState({ messages });
}

addMessage = () => {
  const message = this.state.messages[0];
  this.referenceChatMessages.add({
    _id: message._id,
    text: message.text || "",
    createdAt: message.createdAt,
    user: this.state.user,
    image: message.image || null,
    location: message.location || null
  });
}


renderCustomActions = (props) => {
  return <CustomActions {...props} />;
}

renderCustomView(props) {
  const { currentMessage } = props;
  if (currentMessage.location) {
    return (
      <MapView
        style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
        region={{
          latitude: parseInt(currentMessage.location.latitude),
          longitude: parseInt(currentMessage.location.longitude),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
    );
  }
  return null;
}


  

  render() {
    let name = this.props.route.params.name; 
      this.props.navigation.setOptions({ title: name});

      

    return (
      <View style={{ flex: 1}}>
       <GiftedChat
                    renderInputToolbar={this.renderInputToolbar}
                    messages={this.state.messages}
                    renderActions={this.renderCustomActions}
                    renderCustomView={this.renderCustomView}
                    onSend={messages => this.onSend(messages)}
                    user={this.state.user}
                    />{ Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
  }
    </View>
    );
  };
}