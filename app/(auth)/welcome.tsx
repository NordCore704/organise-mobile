import { View, Text, TouchableOpacity, Image } from 'react-native';
import Svg, { Path, Rect /* ... */ } from 'react-native-svg';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View className="flex-1 flex flex-col gap-6 bg-ink">
      {/* Background image */}
    
      {/* <Image
        source={require('../../assets/images/illustration.png')}
        className="absolute inset-0 h-full w-full"
        resizeMode="cover"
      /> */}

      {/* Dark overlay so white text stays readable */}
      <View className="absolute inset-0 bg-black" />

      {/* Content on top */}
      <View className="flex-1 justify-between px-6 pb-10 pt-16">
          <Image
        source={require('../../assets/images/icon.png')}
        className=""
        resizeMode="cover"
      />

 <View>
          <Text className="text-5xl font-bold leading-tight  text-white">
            Everything your{'\n'}family needs,{'\n'}in one place
          </Text>
          <Text className="mt-4 text-base leading-6 text-white/70 font-medium">
            Tasks, memories, and important documents, shared securely with the
            people who matter.
          </Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center rounded-full bg-white/15 px-2 py-2"
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.9}
        >
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-white">
            <Text className="text-xl text-primary">▶</Text>
          </View>
          <Text className="flex-1 text-base font-semibold text-white">Start</Text>
          <Text className="mr-4 text-white/60">›››</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}