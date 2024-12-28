import { View, Text, TextInput } from 'react-native'
import React from 'react'

interface customTextInputProps {
    placeholder: string
    onChangeText: (text: string) => void
    value: string
    autoCapitalize: "none" | "sentences" | "words" | "characters" | undefined
    }

export default function customTextInput({placeholder, onChangeText, value, autoCapitalize}: customTextInputProps) {
  return (
        <TextInput
        className="h-12 w-72 p-2 m-2 rounded-full items-center self-center bg-white dark:bg-gray-800"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
        />
  )
}