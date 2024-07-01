import { StyleSheet, Text, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';


const Bookmark = () => {
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-white text-2xl font-psemibold">Soon!</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Bookmark

const styles = StyleSheet.create({})