/* eslint-disable react/no-unstable-nested-components */
import type { MaterialBottomTabScreenProps } from '@react-navigation/material-bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type { ParamListBase } from '@react-navigation/native';
import * as React from 'react';
import { DeviceEventEmitter, View } from 'react-native';
import type { DataEventType } from 'react-native-chat-uikit';

import HomeHeaderTitle from '../components/HomeHeaderTitle';
import TabBarIcon from '../components/TabBarIcon';
import { useAppChatSdkContext } from '../contexts/AppImSdkContext';
import type { BizEventType, DataActionEventType } from '../events';
import { sendEvent } from '../events/sendEvent';
import type { RootParamsList } from '../routes';
import ContactList from './ContactList';
import GroupList from './GroupList';
import RequestList from './RequestList';

const Contact = createMaterialTopTabNavigator<RootParamsList>();

type ContactScreenInternalProps = {
  requestFlag: React.RefObject<boolean>;
};
const ContactScreenInternal = React.memo(
  (props: ContactScreenInternalProps) => {
    console.log('test:ContactScreenInternal:', props);
    const { requestFlag } = props;

    const [contactBarState] = React.useState<boolean | undefined>(undefined);
    const [groupBarState] = React.useState<boolean | undefined>(undefined);
    const [requestBarState, setRequestBarState] = React.useState<
      boolean | undefined
    >(requestFlag.current ?? undefined);

    const BarBadge = () => {
      return (
        <View style={{ top: 14, right: 20 }}>
          <View
            style={{
              width: 9,
              height: 9,
              backgroundColor: '#FF14CC',
              borderRadius: 9,
            }}
          />
        </View>
      );
    };

    React.useEffect(() => {
      // const sub = DeviceEventEmitter.addListener(ContactEvent, (event) => {
      //   console.log('test:event:ContactScreenInternal:', event);
      //   const eventType = event.type as ContactEventType;
      //   if (eventType === 'update_state') {
      //     const eventParams = event.params as {
      //       unread: boolean;
      //       barType: ContactEventBarType;
      //     };
      //     const barType = eventParams.barType;
      //     if (barType === 'contact') {
      //       setContactBarState(eventParams.unread as boolean);
      //     } else if (barType === 'group') {
      //       setGroupBarState(eventParams.unread as boolean);
      //     } else if (barType === 'request') {
      //       setRequestBarState(eventParams.unread as boolean);
      //     }
      //   }
      // });
      const sub3 = DeviceEventEmitter.addListener(
        'DataEvent' as DataEventType,
        (event) => {
          const { action, params } = event as {
            eventBizType: BizEventType;
            action: DataActionEventType;
            senderId: string;
            params: any;
            timestamp?: number;
          };
          switch (action) {
            case 'update_request_notification_flag':
              {
                const eventParams = params as {
                  unread: boolean;
                };
                setRequestBarState(eventParams.unread);
              }
              break;

            default:
              break;
          }
        }
      );
      return () => {
        sub3.remove();
      };
    }, []);

    return (
      <Contact.Navigator
        screenOptions={{
          tabBarShowLabel: false,
          // tabBarIndicatorStyle: {backgroundColor: 'red'},
          // tabBarActiveTintColor: 'red',
          // tabBarInactiveTintColor: 'blue',
          // tabBarBounces: false,
          // tabBarIconStyle: {backgroundColor: 'red', borderColor: 'blue'},
          // tabBarContentContainerStyle: { borderColor: 'blue'},
          // tabBarStyle: {shadowColor: 'red'},
          // tabBarIndicatorContainerStyle: {shadowColor: 'blue'}
          // tabBarBadge: BarBadge,
          // tabBarLabelStyle: { borderColor: 'red' },
          // tabBarItemStyle: { height: 40 },
          // tabBarStyle: { borderColor: 'red', backgroundColor: 'blue' },
        }}
      >
        <Contact.Screen
          name="ContactList"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabBarIcon
                focused={focused}
                color={color}
                type="TopContacts"
                state={contactBarState}
              />
            ),
            tabBarBadge: contactBarState === true ? BarBadge : undefined,
          }}
          initialParams={{ params: { type: 'contact_list' } }}
          component={ContactList}
        />
        <Contact.Screen
          name="GroupList"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabBarIcon
                focused={focused}
                color={color}
                type="TopGroups"
                state={groupBarState}
              />
            ),
            tabBarBadge: groupBarState === true ? BarBadge : undefined,
          }}
          component={GroupList}
        />
        <Contact.Screen
          name="RequestList"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabBarIcon
                focused={focused}
                color={color}
                type="TopRequestList"
                state={requestBarState}
              />
            ),
            tabBarBadge: requestBarState === true ? BarBadge : undefined,
          }}
          component={RequestList}
        />
      </Contact.Navigator>
    );
  }
);

export default function ContactScreen({
  navigation,
}: MaterialBottomTabScreenProps<ParamListBase, 'Contact'>): JSX.Element {
  console.log('test:ContactScreen:');
  const requestFlag = React.useRef<boolean>(true);
  const { getAllUnreadCount, getCurrentId } = useAppChatSdkContext();

  const initRequestFlag = React.useCallback(async () => {
    const currentId = getCurrentId();
    if (currentId === undefined || currentId.length === 0) {
      return;
    }
    getAllUnreadCount({
      currentId: currentId,
      onResult: ({ unread, error }) => {
        if (error) {
          console.warn('test:error:', error);
        }
        requestFlag.current = unread;
        sendEvent({
          eventType: 'DataEvent',
          action: 'update_request_notification_flag',
          params: { unread: unread },
          eventBizType: 'message',
          senderId: 'Contact',
        });
      },
    });
  }, [getAllUnreadCount, getCurrentId]);

  React.useEffect(() => {
    const sub = navigation.addListener('focus', () => {
      navigation.getParent()?.setOptions({
        headerBackVisible: false,
        headerRight: undefined,
        headerTitle: () => <HomeHeaderTitle name="Contacts" />,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      });
    });
    initRequestFlag();
    return () => {
      sub();
    };
  }, [initRequestFlag, navigation]);

  return <ContactScreenInternal requestFlag={requestFlag} />;
}
