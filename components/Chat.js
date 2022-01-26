import React from 'react';
import { View, Platform, KeyboardAvoidingView, Text, Button, TextInput  } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'


export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = { messages: [],};
  }
  componentDidMount() {
    // get username prop from Start.js
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });

    
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
        {
          _id: 2,
          text: 'This is a system message',
          createdAt: new Date(),
          system: true,
         },
      ],
    })
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }
  

  

  render() {
    //let name = this.props.route.params.name; 
      //this.props.navigation.setOptions({ title: name});

      

    return (
      <View style={{ flex: 1}}>
      <GiftedChat
      messages={this.state.messages}
      onSend={messages => this.onSend(messages)}
      user={{
        _id: 1,
      }}
    />{ Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
  }
    </View>
    );
  };
}