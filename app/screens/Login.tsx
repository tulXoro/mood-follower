import { View, Text, TextInput } from 'react-native'
import React, { useState } from 'react'
import { FIREBASE_AUTH } from '../../firebaseConfig';



const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const AUTH = FIREBASE_AUTH;

    
  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        />
        <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        />
    </View>
  )
}

export default Login;