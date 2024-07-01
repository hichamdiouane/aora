import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Text, View } from "react-native";

import { EmptyState, SearchInput, VideoCard } from "../../components";

import { searchPosts } from "../../lib/appwrite"
import useAppwrite from "../../lib/useAppwrite";

import { useLocalSearchParams } from 'expo-router'

const Search = () => {
  const {data: posts, refetch} = useAppwrite(() =>  searchPosts(query) )
  const { query } = useLocalSearchParams()

  useEffect(() => {
    refetch()
  },[query])

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            creator={item.creator?.username || null}
            avatar={item.creator?.avatar || null}
          />
        )}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4">
            <Text className="font-pmedium text-sm text-gray-100">
              Search Results
            </Text>

            <Text className="text-2xl font-psemibold text-white">
              {query}
            </Text>
            
            <View className="mt-6 mb-8">
              <SearchInput initialQuery={query} />
            </View>

          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos founded for this search query"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Search;