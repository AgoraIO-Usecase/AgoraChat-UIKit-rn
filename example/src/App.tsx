/* eslint-disable react/no-unstable-nested-components */
import './utils/globals';

import CreateThumbnail from '@easemob/react-native-create-thumbnail';
import { CameraRoll as MediaLibrary } from '@react-native-camera-roll/camera-roll';
import Clipboard from '@react-native-clipboard/clipboard';
import FirebaseMessage from '@react-native-firebase/messaging';
import {
  DarkTheme as NDarkTheme,
  DefaultTheme as NDefaultTheme,
  NavigationAction,
  NavigationContainer,
  NavigationState,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { registerRootComponent } from 'expo';
import * as React from 'react';
import { Linking, Platform, View } from 'react-native';
import * as Audio from 'react-native-audio-recorder-player';
import {
  CallUser,
  GlobalContainer as CallkitContainer,
} from 'react-native-chat-callkit';
import { ChatClient } from 'react-native-chat-sdk';
import {
  createStringSetEn2,
  DarkTheme,
  getScaleFactor,
  GlobalContainer,
  LightTheme,
  Loading,
  Services,
  updateScaleFactor,
} from 'react-native-chat-uikit';
import * as DocumentPicker from 'react-native-document-picker';
import * as FileAccess from 'react-native-file-access';
import * as ImagePicker from 'react-native-image-picker';
import * as Permissions from 'react-native-permissions';
import VideoComponent from 'react-native-video';

import Dev from './__dev__';
import HomeHeaderRight from './components/HomeHeaderRight';
import HomeHeaderTitle from './components/HomeHeaderTitle';
import { AppChatSdkContext } from './contexts/AppImSdkContext';
import { ModalPlaceholder } from './events';
import { sendEvent } from './events/sendEvent';
import { AppStringSet } from './I18n/AppCStringSet.en';
import type { RootParamsList, RootParamsName } from './routes';
import AvatarPreviewList from './screens/AvatarPreviewList';
import Chat from './screens/Chat';
import ContactInfo from './screens/ContactInfo';
import ContactList from './screens/ContactList';
import GroupInfo from './screens/GroupInfo';
import HomeScreen from './screens/Home';
import ImagePreview from './screens/ImagePreview';
import LoginScreen from './screens/Login';
import Search from './screens/Search';
import { SplashScreen } from './screens/Splash';
import { createAppScaleFactor } from './styles/createAppScaleFactor';
import { AppServerClient } from './utils/AppServer';

if (Platform.OS === 'web') {
  console.error('web platforms are not supported.');
}

const Root = createNativeStackNavigator<RootParamsList>();

const __KEY__ = '__KEY__';
let __TEST__ = true;
let appKey = '';
let agoraAppId = '';
let accountType = '';
const enableLog = true;
let agoraDomain = '';

try {
  const env = require('./env');
  __TEST__ = env.test ?? false;
  appKey = env.appKey;
  agoraAppId = env.agoraAppId;
  accountType = env.accountType;
  agoraDomain = env.agoraDomain;
} catch (e) {
  console.warn('test:', e);
}

console.log('DEV:', __DEV__);
console.log('TEST:', __TEST__);

export default function App() {
  updateScaleFactor(createAppScaleFactor());

  const isLightTheme = LightTheme.scheme === 'light';

  const permission = Services.createPermissionService({
    permissions: Permissions,
    firebaseMessage: FirebaseMessage,
  });

  const media = Services.createMediaService({
    videoModule: VideoComponent,
    videoThumbnail: CreateThumbnail,
    imagePickerModule: ImagePicker,
    documentPickerModule: DocumentPicker,
    mediaLibraryModule: MediaLibrary,
    fsModule: FileAccess,
    audioModule: Audio,
    permission: permission,
  });

  const storage = Services.createLocalStorageService();

  const [isReady, setIsReady] = React.useState(__DEV__ ? true : true);
  const [initialState, setInitialState] = React.useState();
  const [initialRouteName] = React.useState('Splash' as RootParamsName);
  const sf = getScaleFactor();
  const autoLogin = React.useRef(true);
  const RootRef = useNavigationContainerRef<RootParamsList>();
  const isOnInitialized = React.useRef(false);
  const isOnReady = React.useRef(false);

  React.useEffect(() => {
    const restoreState = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();

        if (Platform.OS !== 'web' && initialUrl == null) {
          // Only restore state if there's no deep link and we're not on web
          const savedStateString = await storage.getItem(__KEY__);
          const state = savedStateString
            ? JSON.parse(savedStateString)
            : undefined;

          if (state !== undefined) {
            setInitialState(state);
          }
        }
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady, storage]);
  console.log('test:App:isReady:', isReady);

  const onInitApp = React.useCallback(() => {
    console.log('test:onInitApp:', isOnInitialized, isOnReady);
    if (isOnInitialized.current === false || isOnReady.current === false) {
      return;
    }

    if (accountType !== 'easemob') {
      AppServerClient.rtcTokenUrl = `http://${agoraDomain}/token/rtc/channel`;
      AppServerClient.mapUrl = `http://${agoraDomain}/agora/channel/mapper`;
    }

    console.log('test:onInitApp:');
    sendEvent({
      eventType: 'DataEvent',
      action: 'on_initialized',
      params: { autoLogin: autoLogin.current, navigation: RootRef },
      eventBizType: 'setting',
      senderId: 'App',
    });
  }, [RootRef, isOnInitialized, isOnReady]);

  if (!isReady) {
    return null;
  }

  const formatNavigationState = (
    state: NavigationState | undefined,
    result: string[] & string[][]
  ) => {
    if (state) {
      const ret: string[] & string[][] = [];
      for (const route of state.routes) {
        ret.push(route.name);
        if (route.state) {
          formatNavigationState(
            route.state as NavigationState | undefined,
            ret
          );
        }
      }
      result.push(ret);
    }
  };

  return (
    <React.StrictMode>
      <GlobalContainer
        option={{
          appKey: appKey,
          autoLogin: autoLogin.current,
          debugModel: true,
          requireAck: true,
          requireDeliveryAck: true,
        }}
        onInitialized={() => {
          isOnInitialized.current = true;
          onInitApp();
        }}
        theme={isLightTheme ? LightTheme : DarkTheme}
        localization={createStringSetEn2(new AppStringSet())}
        sdk={
          new AppChatSdkContext({
            client: ChatClient.getInstance(),
          })
        }
        header={{
          defaultTitleAlign: 'center',
          defaultStatusBarTranslucent: true,
          defaultHeight: sf(44),
          defaultTopInset: sf(44),
        }}
        services={{
          clipboard: Services.createClipboardService({
            clipboard: Clipboard,
          }),
          notification: Services.createNotificationService({
            firebaseMessage: FirebaseMessage,
            permission: permission,
          }),
          media: media,
          permission: permission,
          storage: storage,
          dir: Services.createDirCacheService({
            media: media,
          }),
        }}
        ModalComponent={() => <ModalPlaceholder />}
      >
        <CallkitContainer
          option={{
            appKey: appKey,
            agoraAppId: agoraAppId,
          }}
          type={accountType as any}
          enableLog={enableLog}
          requestRTCToken={(params: {
            appKey: string;
            channelId: string;
            userId: string;
            userChannelId?: number | undefined;
            type?: 'easemob' | 'agora' | undefined;
            onResult: (params: { data?: any; error?: any }) => void;
          }) => {
            console.log('requestRTCToken:', params);
            AppServerClient.getRtcToken({
              userAccount: params.userId,
              channelId: params.channelId,
              appKey,
              userChannelId: params.userChannelId,
              type: params.type,
              onResult: (pp: { data?: any; error?: any }) => {
                console.log('test:', pp);
                params.onResult(pp);
              },
            });
          }}
          requestUserMap={(params: {
            appKey: string;
            channelId: string;
            userId: string;
            onResult: (params: { data?: any; error?: any }) => void;
          }) => {
            console.log('requestUserMap:', params);
            AppServerClient.getRtcMap({
              userAccount: params.userId,
              channelId: params.channelId,
              appKey,
              onResult: (pp: { data?: any; error?: any }) => {
                console.log('requestUserMap:getRtcMap:', pp);
                params.onResult(pp);
              },
            });
          }}
          requestCurrentUser={(params: {
            onResult: (params: { user: CallUser; error?: any }) => void;
          }) => {
            console.log('requestCurrentUser:', params);
            ChatClient.getInstance()
              .getCurrentUsername()
              .then((result) => {
                params.onResult({
                  user: {
                    userId: result,
                    userName: `${result}_self_name`,
                    userAvatarUrl:
                      'https://cdn3.iconfinder.com/data/icons/vol-2/128/dog-128.png',
                  },
                });
              })
              .catch((error) => {
                console.warn('test:getCurrentUsername:error:', error);
              });
          }}
          requestUserInfo={(params: {
            userId: string;
            onResult: (params: { user: CallUser; error?: any }) => void;
          }) => {
            console.log('requestCurrentUser:', params);
            // pseudo
            params.onResult({
              user: {
                userId: params.userId,
                userName: `${params.userId}_name2`,
                userAvatarUrl:
                  'https://cdn2.iconfinder.com/data/icons/pet-and-veterinary-1/85/dog_charity_love_adopt_adoption-128.png',
              },
            });
          }}
        >
          {__TEST__ === true ? (
            Dev()
          ) : (
            <NavigationContainer
              ref={RootRef}
              initialState={initialState}
              theme={isLightTheme ? NDefaultTheme : NDarkTheme}
              onStateChange={(state: NavigationState | undefined) => {
                const rr: string[] & string[][] = [];
                formatNavigationState(state, rr);
                console.log(
                  'test:onStateChange:',
                  JSON.stringify(rr, undefined, '  ')
                );
                // console.log('test:onStateChange:o:', JSON.stringify(state));
                storage.setItem(__KEY__, JSON.stringify(state));
              }}
              onUnhandledAction={(action: NavigationAction) => {
                console.log('test:onUnhandledAction:', action);
              }}
              onReady={() => {
                console.log('test:NavigationContainer:onReady:');
                isOnReady.current = true;
                onInitApp();
              }}
              fallback={
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                  }}
                >
                  <Loading color="rgba(15, 70, 230, 1)" size={sf(45)} />
                </View>
              }
            >
              <Root.Navigator initialRouteName={initialRouteName}>
                <Root.Screen
                  name="Splash"
                  options={{
                    headerShown: false,
                  }}
                  component={SplashScreen}
                />
                <Root.Screen
                  name="Login"
                  options={{
                    headerShown: false,
                  }}
                  component={LoginScreen}
                />
                <Root.Screen
                  name="Home"
                  options={() => {
                    return {
                      headerBackVisible: true,
                      headerRight: HomeHeaderRight,
                      headerTitle: () => <HomeHeaderTitle name="Chats" />,
                      headerShadowVisible: false,
                      headerBackTitleVisible: false,
                    };
                  }}
                  component={HomeScreen}
                />
                <Root.Group>
                  <Root.Screen
                    name="ContactInfo"
                    options={() => {
                      return {
                        headerTitle: '',
                        headerShadowVisible: false,
                        headerBackTitleVisible: false,
                      };
                    }}
                    component={ContactInfo}
                  />
                  <Root.Screen
                    name="GroupInfo"
                    options={() => {
                      return {
                        headerTitle: '',
                        headerShadowVisible: false,
                        headerBackTitleVisible: false,
                      };
                    }}
                    component={GroupInfo}
                  />
                  <Root.Screen
                    name="ContactList"
                    // options={({ route }) => {
                    //   return {
                    //     headerBackVisible: true,
                    //     headerRight: ContactListHeader,
                    //     headerTitle: route.name,
                    //     headerShadowVisible: false,
                    //   };
                    // }}
                    component={ContactList}
                  />
                  <Root.Screen
                    name="Chat"
                    options={() => {
                      return {
                        headerTitle: '',
                        headerShadowVisible: false,
                        headerBackTitleVisible: false,
                      };
                    }}
                    component={Chat}
                  />
                  <Root.Screen
                    name="Search"
                    options={() => {
                      return {
                        headerShown: false,
                        presentation: 'fullScreenModal',
                      };
                    }}
                    component={Search}
                  />
                  <Root.Screen
                    name="ImagePreview"
                    options={() => {
                      return {
                        headerShown: false,
                        presentation: 'fullScreenModal',
                      };
                    }}
                    component={ImagePreview}
                  />
                  <Root.Screen
                    name="AvatarPreviewList"
                    options={() => {
                      return {
                        headerShown: true,
                        // presentation: 'fullScreenModal',
                      };
                    }}
                    component={AvatarPreviewList}
                  />
                </Root.Group>
              </Root.Navigator>
            </NavigationContainer>
          )}
        </CallkitContainer>
      </GlobalContainer>
    </React.StrictMode>
  );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
// registerRootComponent(App);
