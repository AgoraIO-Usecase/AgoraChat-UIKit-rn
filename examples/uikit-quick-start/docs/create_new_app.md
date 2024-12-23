# How to create a new project and use UIKit ?

1. Create a React-Native application project.

```sh
npx react-native init RNUIkitQuickExamle --version 0.71.11
```

2. Initialize the project.

```sh
yarn && yarn run env
```

3. Add dependencies to the project and re-run the `yarn` command.

```sh
yarn add @react-native-async-storage/async-storage \
@react-native-camera-roll/camera-roll \
@react-native-clipboard/clipboard \
@react-native-firebase/app \
@react-native-firebase/messaging \
react-native-audio-recorder-player \
react-native-agora-chat \
react-native-agora-chat-uikit \
react-native-create-thumbnail \
react-native-document-picker \
react-native-fast-image \
react-native-file-access \
react-native-get-random-values \
react-native-image-picker \
react-native-permissions \
react-native-safe-area-context \
react-native-screens \
react-native-video
```

For callkit, you also need to add dependencies.

```sh
yarn add react-native-agora \
react-native-agora-chat \
react-native-device-info \
react-native-fast-image \
react-native-pager-view \
react-native-paper \
react-native-permissions \
react-native-safe-area-context \
react-native-screens \
react-native-tab-view
```

4. Configure the iOS platform.

Add the following content to the `ios/Podfile` file in the iOS folder:

```ruby
target 'RNUIkitQuickExamle' do

  pod 'GoogleUtilities', :modular_headers => true
  pod 'FirebaseCore', :modular_headers => true

  permissions_path = File.join(File.dirname(`node --print "require.resolve('react-native-permissions/package.json')"`), "ios")
  pod 'Permission-Camera', :path => "#{permissions_path}/Camera"
  pod 'Permission-MediaLibrary', :path => "#{permissions_path}/MediaLibrary"
  pod 'Permission-Microphone', :path => "#{permissions_path}/Microphone"
  pod 'Permission-Notifications', :path => "#{permissions_path}/Notifications"
  pod 'Permission-PhotoLibrary', :path => "#{permissions_path}/PhotoLibrary"

end

```

Add the following content to the `ios/RNUIkitQuickExamle/Info.plist` file under the ios folder:

```xml
<dict>
	<key>NSCameraUsageDescription</key>
	<string></string>
	<key>NSMicrophoneUsageDescription</key>
	<string></string>
	<key>NSPhotoLibraryUsageDescription</key>
	<string></string>
</dict>
```

5. Configure the Android platform.

Add the following content to the `android/build.gradle` file under the Android folder:

```groovy
buildscript {
    ext {
        kotlinVersion = '1.6.10'
        if (findProperty('android.kotlinVersion')) {
            kotlinVersion = findProperty('android.kotlinVersion')
        }
    }
    dependencies {
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}
```

Add the following content to the `android/app/src/main/AndroidManifest.xml` file under the Android folder:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />

</manifest>
```

6. Write the necessary code to integrate `UIKit`.

The necessary code includes initializing `UIKit`, logging in to the server, and entering the chat page to start chatting. Added simple page routing and jumps for demonstration purposes.

initialization:

```typescript
export const App = () => {
  return (
    <UikitContainer
      option={{
        appKey: appKey,
        autoLogin: autoLogin,
        debugModel: debugModel,
      }}
    >
      <NavigationContainer>
        <Root.Navigator initialRouteName="Main">
          <Root.Screen name="Main" component={MainScreen} />
          <Root.Screen name="Chat" component={ChatScreen} />
        </Root.Navigator>
      </NavigationContainer>
    </UikitContainer>
  );
};
```

Chat details:

```typescript
export function ChatScreen({
  route,
}: NativeStackScreenProps<typeof RootParamsList>): JSX.Element {
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment
        screenParams={{
          params: route.params as any,
        }}
      />
    </ScreenContainer>
  );
}
```

7. Run the project.

```sh
yarn run ios
# or
yarn run android
```
