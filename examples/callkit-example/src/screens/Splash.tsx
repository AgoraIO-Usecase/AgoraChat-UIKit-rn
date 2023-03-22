import {
  type NavigationContainerRefWithCurrent,
  CommonActions,
  StackActions,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { DeviceEventEmitter, View } from 'react-native';
import {
  ConnectStateChatSdkEvent,
  ConnectStateChatSdkEventType,
  DataEventType,
  getScaleFactor,
  Loading,
  Services,
} from 'react-native-chat-uikit';

import { useAppChatSdkContext } from '../contexts/AppImSdkContext';
import type { BizEventType, DataActionEventType } from '../events';
import type { RootParamsList } from '../routes';

let gid: string = '';
let gps: string = '';
let gt = 'agora' as 'agora' | 'easemob';

try {
  const env = require('../env');
  gid = env.id ?? '';
  gps = env.ps ?? '';
  gt = env.accountType ?? 'agora';
} catch (e) {
  console.warn('test:', e);
}

export function SplashScreen({
  navigation,
}: NativeStackScreenProps<RootParamsList, 'Splash'>): JSX.Element {
  console.log('test:SplashScreen:');
  const sf = getScaleFactor();
  const {
    autoLogin: autoLoginAction,
    getCurrentId,
    client,
  } = useAppChatSdkContext();

  const createUserDir = React.useCallback(() => {
    const currentId = getCurrentId();
    if (currentId.length > 0) {
      Services.dcs.init(
        `${client.options!.appKey.replace('#', '-')}/${currentId}`
      );
    }
  }, [client.options, getCurrentId]);

  const onDisconnected = React.useCallback(
    (errorCode?: number) => {
      console.warn('test:onDisconnected:', errorCode);
      if (
        errorCode === 202 ||
        errorCode === 206 ||
        errorCode === 207 ||
        errorCode === 214 ||
        errorCode === 216 ||
        errorCode === 217 ||
        errorCode === 305
      ) {
        navigation.navigate('Login', {
          params: { id: gid, pass: gps, accountType: gt },
        });
      }
    },
    [navigation]
  );

  const onTokenDidExpire = React.useCallback(() => {
    console.log('test:onTokenDidExpire:');
    navigation.navigate('Login', {
      params: { id: gid, pass: gps, accountType: gt },
    });
  }, [navigation]);

  const onTokenWillExpire = React.useCallback(() => {
    console.log('test:onTokenWillExpire:');
  }, []);

  const addListeners = React.useCallback(() => {
    const sub2 = DeviceEventEmitter.addListener(
      ConnectStateChatSdkEvent,
      (event) => {
        console.log('test:SplashScreen:addListener:', event);
        const eventType = event.type as ConnectStateChatSdkEventType;
        switch (eventType) {
          case 'onConnected':
            break;
          case 'onDisconnected':
            {
              const eventParams = event.params as { error: number | undefined };
              onDisconnected(eventParams.error);
            }
            break;
          case 'onTokenDidExpire':
            onTokenDidExpire();
            break;
          case 'onTokenWillExpire':
            onTokenWillExpire();
            break;

          default:
            break;
        }
      }
    );
    const sub3 = DeviceEventEmitter.addListener(
      'DataEvent' as DataEventType,
      (event) => {
        const { action, params } = event as {
          eventBizType: BizEventType;
          action: DataActionEventType;
          senderId: string;
          params: any;
          timestamp: number;
          key: string;
        };
        switch (action) {
          case 'on_initialized':
            {
              const eventParams = params as {
                autoLogin: boolean;
                navigation: NavigationContainerRefWithCurrent<RootParamsList>;
              };
              if (eventParams.autoLogin === true) {
                autoLoginAction({
                  onResult: ({ result, error }) => {
                    if (error === undefined) {
                      if (result === true) {
                        createUserDir();
                        eventParams.navigation.dispatch(
                          StackActions.push('Home', {
                            params: { id: 'sdf', pass: 'xxx' },
                          })
                        );
                      } else {
                        eventParams.navigation.dispatch(
                          CommonActions.navigate('Login', {
                            params: {
                              id: gid,
                              pass: gps,
                              accountType: gt,
                            },
                          })
                        );
                      }
                    } else {
                      console.warn('test:error:', error);
                    }
                  },
                });
              } else {
                eventParams.navigation.dispatch(
                  CommonActions.navigate('Login', {
                    params: { id: gid, pass: gps, accountType: gt },
                  })
                );
              }
            }
            break;
          case 'on_logined':
            createUserDir();
            break;

          default:
            break;
        }
      }
    );
    return () => {
      sub2.remove();
      sub3.remove();
    };
  }, [
    autoLoginAction,
    createUserDir,
    onDisconnected,
    onTokenDidExpire,
    onTokenWillExpire,
  ]);

  React.useEffect(() => {
    const load = () => {
      console.log('test:load:', SplashScreen.name);
      const unsubscribe = addListeners();
      return {
        unsubscribe: unsubscribe,
      };
    };
    const unload = (params: { unsubscribe: () => void }) => {
      console.log('test:unload:', SplashScreen.name);
      params.unsubscribe();
    };

    const res = load();
    return () => unload(res);
  }, [addListeners]);

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        // backgroundColor: 'red',
      }}
    >
      <Loading color="rgba(15, 70, 230, 1)" size={sf(45)} />
    </View>
  );
}
