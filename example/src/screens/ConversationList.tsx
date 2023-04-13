import type {
  MaterialBottomTabNavigationProp,
  MaterialBottomTabScreenProps,
} from '@react-navigation/material-bottom-tabs';
import type {
  CompositeNavigationProp,
  CompositeScreenProps,
} from '@react-navigation/native';
import type {
  HeaderButtonProps,
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack/lib/typescript/src/types';
import * as React from 'react';
import {
  DeviceEventEmitter,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Badge,
  createStyleSheet,
  DataEventType,
  DefaultAvatar,
  EqualHeightListItemComponent,
  getScaleFactor,
  LocalIcon,
  messageTime,
} from 'react-native-chat-uikit';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeHeaderTitle from '../components/HomeHeaderTitle';
import type { BizEventType, DataActionEventType } from '../events';
import { type sendEventProps, sendEvent } from '../events/sendEvent';
import ConversationListFragment, {
  ConversationListFragmentRef,
  ItemDataType as ConversationListItemDataType,
  ItemDataType,
} from '../fragments/ConversationList';
import { useStyleSheet } from '../hooks/useStyleSheet';
import type {
  BottomTabParamsList,
  BottomTabScreenParamsList,
  RootParamsList,
  RootScreenParamsList,
} from '../routes';

type RootScreenParamsListOnly = Omit<
  RootScreenParamsList,
  keyof BottomTabScreenParamsList
>;
type Props = CompositeScreenProps<
  MaterialBottomTabScreenProps<BottomTabScreenParamsList, 'ConversationList'>,
  NativeStackScreenProps<RootScreenParamsListOnly>
>;

export type NavigationProp = CompositeNavigationProp<
  MaterialBottomTabNavigationProp<
    BottomTabScreenParamsList<BottomTabParamsList, 'option'>,
    any,
    undefined
  >,
  NativeStackNavigationProp<
    RootScreenParamsList<RootParamsList, 'option'>,
    any,
    undefined
  >
>;

const sendConversationEvent = (
  params: Omit<sendEventProps, 'senderId' | 'timestamp' | 'eventBizType'>
) => {
  sendEvent({
    ...params,
    senderId: 'Conversation',
    eventBizType: 'conversation',
  } as sendEventProps);
};

const RenderItem: EqualHeightListItemComponent = (props) => {
  const sf = getScaleFactor();
  const item = props.data as ItemDataType;
  const { width: screenWidth } = useWindowDimensions();
  const extraWidth = item.sideslip?.width ?? sf(100);
  return (
    <View style={[styles.item, { width: screenWidth + extraWidth }]}>
      <View
        style={{
          // width: screenWidth,
          flexGrow: 1,
          flexShrink: 1,
          flexDirection: 'row',
        }}
      >
        <DefaultAvatar id={item.convId} size={sf(50)} radius={sf(25)} />
        <View style={[styles.itemText, { justifyContent: 'space-between' }]}>
          <Text style={{ maxWidth: screenWidth * 0.5 }} numberOfLines={1}>
            {item.convName ? item.convName : item.convId}
          </Text>
          <Text style={{ maxWidth: screenWidth * 0.6 }} numberOfLines={1}>
            {item.convContent}
          </Text>
        </View>
        <View
          style={{
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexGrow: 1,
          }}
        >
          <Text>{messageTime(item.timestamp)}</Text>
          {item.count > 0 ? (
            <Badge
              count={item.count}
              badgeColor="rgba(255, 20, 204, 1)"
              size="default"
            />
          ) : null}
        </View>
      </View>
      <View
        style={{
          // flexGrow: 1,
          width: extraWidth, // ??? why
          height: sf(60),
          flexDirection: 'row',
          // backgroundColor: 'green',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <View style={{ width: sf(20) }} />
        <Pressable
          style={{
            height: sf(30),
            width: sf(30),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F2F2F2',
            overflow: 'hidden',
            borderRadius: sf(30),
          }}
          onPress={() => {
            item.actions?.onMute?.(item);
          }}
        >
          <LocalIcon name="bell_slash" size={20} color="#666666" />
        </Pressable>
        <View style={{ width: sf(15) }} />
        <Pressable
          style={{
            height: sf(30),
            width: sf(30),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 20, 204, 1)',
            overflow: 'hidden',
            borderRadius: sf(30),
          }}
          onPress={() => {
            item.actions?.onDelete?.(item);
          }}
          onStartShouldSetResponder={(_) => {
            return true;
          }}
          onStartShouldSetResponderCapture={(_) => {
            return true;
          }}
          onMoveShouldSetResponder={(_) => {
            return true;
          }}
          onResponderEnd={(_) => {
            return true;
          }}
          onResponderGrant={(_) => {
            return true;
          }}
        >
          <LocalIcon name="trash" size={sf(20)} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

export default function ConversationListScreen({
  navigation,
}: Props): JSX.Element {
  const sf = getScaleFactor();
  // let data: ConversationListItemDataType[] = React.useMemo(() => [], []); // for search
  const [, setData] = React.useState([] as ConversationListItemDataType[]); // for search
  const convRef = React.useRef<ConversationListFragmentRef>({} as any);

  const NavigationHeaderRight: React.FunctionComponent<HeaderButtonProps> =
    React.useCallback(
      (_: HeaderButtonProps) => {
        return (
          <Pressable
            onPress={() => {
              sendConversationEvent({
                eventType: 'SheetEvent',
                action: 'sheet_navigation_menu',
                params: {},
              });
            }}
          >
            <View style={{ padding: sf(10), marginRight: -sf(10) }}>
              <LocalIcon
                name="chat_nav_add"
                style={{ padding: 0 }}
                size={sf(20)}
              />
            </View>
          </Pressable>
        );
      },
      [sf]
    );

  const sortPolicy = React.useCallback(
    (a: ConversationListItemDataType, b: ConversationListItemDataType) => {
      if (a.key > b.key) {
        return 1;
      } else if (a.key < b.key) {
        return -1;
      } else {
        return 0;
      }
    },
    []
  );

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      navigation.getParent()?.setOptions({
        headerBackVisible: false,
        headerRight: NavigationHeaderRight,
        headerTitle: () => <HomeHeaderTitle name="Chats" />,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      });
    });
    return unsubscribe;
  }, [NavigationHeaderRight, navigation]);

  React.useEffect(() => {
    console.log('test:load:', ConversationListScreen.name);
    const sub = DeviceEventEmitter.addListener(
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
          case 'create_conversation_item':
            navigation.navigate({
              name: 'ContactList',
              params: { params: { type: 'create_conversation' } },
            });
            break;
          case 'create_new_group':
            navigation.navigate('ContactList', {
              params: { type: 'create_group' },
            });
            break;
          case 'add_new_contact':
            navigation.navigate('Search', {
              params: { type: 'add_contact' },
            });
            break;
          case 'search_public_group_info':
            navigation.navigate('Search', {
              params: { type: 'search_public_group_info' },
            });
            break;
          case 'join_public_group':
            navigation.navigate('Search', {
              params: { type: 'join_public_group' },
            });
            break;
          case 'on_send_before':
            convRef.current?.update(params.message);
            break;
          case 'on_send_result':
            convRef.current?.update(params.message);
            break;
          case 'exec_create_conversation':
            convRef.current?.create(params);
            break;

          case 'update_conversation_read_state':
            convRef.current?.updateRead(params);
            break;

          default:
            break;
        }
      }
    );

    return () => {
      console.log('test:unload:', ConversationListScreen.name);
      sub.remove();
    };
  }, [navigation]);

  return (
    <SafeAreaView
      mode="padding"
      style={useStyleSheet().safe}
      edges={['right', 'left']}
    >
      <ConversationListFragment
        propsRef={convRef}
        onLongPress={(_?: ConversationListItemDataType) => {
          sendConversationEvent({
            eventType: 'SheetEvent',
            action: 'sheet_conversation_list',
            params: {},
          });
        }}
        onPress={(data?: ConversationListItemDataType) => {
          if (data) {
            const d = data as ConversationListItemDataType;
            navigation.navigate('Chat', {
              params: { chatId: d.convId, chatType: d.convType },
            });
          }
        }}
        onData={(d) => {
          setData(d);
        }}
        onUpdateReadCount={(unreadCount) => {
          sendEvent({
            eventType: 'DataEvent',
            action: 'update_all_count',
            params: { count: unreadCount },
            eventBizType: 'conversation',
            senderId: 'ConversationList',
          });
        }}
        sortPolicy={sortPolicy}
        RenderItem={RenderItem}
        RenderItemExtraWidth={sf(100)}
      />
    </SafeAreaView>
  );
}

const styles = createStyleSheet({
  item: {
    // flex: 1,
    // backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 0,
    marginHorizontal: 0,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    marginLeft: 10,
  },
  blank: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
