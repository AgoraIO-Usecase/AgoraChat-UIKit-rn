import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { DeviceEventEmitter, Platform } from 'react-native';
import {
  AudioEncoderAndroidType,
  type AudioSet,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AVModeIOSOption,
} from 'react-native-audio-recorder-player';
import {
  ChatConversationType,
  ChatMessage,
  ChatMessageStatus,
  ChatMessageType,
} from 'react-native-chat-sdk';
import {
  ChatFragment,
  ChatFragmentRef,
  DataEventType,
  getFileExtension,
  ImageMessageItemType,
  localUrl,
  localUrlEscape,
  MessageBubbleListFragment,
  MessageBubbleListProps,
  MessageBubbleListRef,
  MessageItemType,
  playUrl,
  ScreenContainer,
  Services,
  uuid,
  VoiceMessageItemType,
} from 'react-native-chat-uikit';

import { MyFileMessageBubble } from '../components/MyFileMessageBubble';
import { MyTextMessageBubble } from '../components/MyTextMessageBubble';
import { MyVideoMessageBubble } from '../components/MyVideoMessageBubble';
import { useAppChatSdkContext } from '../contexts/AppImSdkContext';
import type { BizEventType, DataActionEventType } from '../events';
import { sendEvent, sendEventProps } from '../events/sendEvent';
// import ChatFragment, { ChatFragmentRef } from '../fragments/Chat';
// import type {
//   ImageMessageItemType,
//   MessageBubbleListProps,
//   MessageItemType,
//   VoiceMessageItemType,
// } from '../fragments/MessageBubbleListFragment';
// import MessageBubbleListFragment from '../fragments/MessageBubbleListFragment';
import type { RootScreenParamsList } from '../routes';

type Props = NativeStackScreenProps<RootScreenParamsList>;

// type NavigationProp = NativeStackNavigationProp<
//   RootScreenParamsList<RootParamsList, 'option'>,
//   'Chat',
//   undefined
// >;

const sendEventFromChat = (
  params: Omit<sendEventProps, 'senderId' | 'timestamp' | 'eventBizType'>
) => {
  sendEvent({
    ...params,
    senderId: 'Chat',
    eventBizType: 'chat',
  } as sendEventProps);
};

export default function ChatScreen({ route, navigation }: Props): JSX.Element {
  console.log('test:ChatScreen:');
  const rp = route.params as any;
  const params = rp?.params as { chatId: string; chatType: number };
  const chatId = params.chatId;
  const chatType = params.chatType as ChatConversationType;
  const messageBubbleListRef = React.useRef<MessageBubbleListRef>({} as any);
  const chatRef = React.useRef<ChatFragmentRef>({} as any);
  const { client, currentId } = useAppChatSdkContext();
  const showTimeLabel = true;

  const onClickMessageBubble = React.useCallback(
    (data: MessageItemType) => {
      const eventParams = data;
      if (eventParams.type === ChatMessageType.VOICE) {
        const voice = eventParams as VoiceMessageItemType;
        if (voice.localPath) {
          Services.ms
            .playAudio({
              url: localUrlEscape(playUrl(voice.localPath)),
              onPlay({ isMuted, currentPosition, duration }) {
                console.log('test:onPlay', isMuted, currentPosition, duration);
              },
            })
            .then(() => {
              console.log('test:playAudio:finish:2:');
            })
            .catch((error) => {
              console.warn('test:error:', error);
            });
        }
      } else if (eventParams.type === ChatMessageType.IMAGE) {
        const imageData = data as ImageMessageItemType;
        const url = imageData.remoteUrl;
        const localPath = imageData.localPath;
        navigation.push('ImagePreview', {
          params: { url: url ?? '', localPath: localPath ?? '' },
        });
      }
    },
    [navigation]
  );

  const onClickInputMoreButton = React.useCallback(() => {
    sendEventFromChat({
      eventType: 'SheetEvent',
      action: 'open_input_extension',
      params: {},
    });
  }, []);

  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: chatId,
    });
  }, [chatId, navigation]);

  const onPressInInputVoiceButton = React.useCallback(() => {
    sendEventFromChat({
      eventType: 'VoiceStateEvent',
      action: 'enable_voice',
      params: {},
    });
    // !!! The simulator will crash.
    Services.ms
      .startRecordAudio({
        audio: {
          AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
          AudioSourceAndroid: AudioSourceAndroidType.MIC,
          AVModeIOS: AVModeIOSOption.measurement,
          AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
          AVNumberOfChannelsKeyIOS: 2,
          AVFormatIDKeyIOS: AVEncodingOption.aac,
        } as AudioSet,
        onPosition: (pos) => {
          console.log('test:startRecordAudio:pos:', pos);
        },
        onFailed: (error) => {
          console.warn('test:startRecordAudio:onFailed:', error);
        },
        onFinished: ({ result, path, error }) => {
          console.log('test:startRecordAudio:onFinished:', result, path, error);
        },
      })
      .then((result) => {
        console.log('test:startRecordAudio:result:', result);
      })
      .catch((error) => {
        console.warn('test:startRecordAudio:error:', error);
      });
  }, []);
  const onVoiceRecordEnd = React.useCallback((params: any) => {
    chatRef.current.sendVoiceMessage(params);
  }, []);
  const onPressOutInputVoiceButton = React.useCallback(() => {
    sendEventFromChat({
      eventType: 'VoiceStateEvent',
      action: 'disable_voice',
      params: {},
    });
    let localPath = localUrl(Services.dcs.getFileDir(chatId, uuid()));
    Services.ms
      .stopRecordAudio()
      .then((result?: { pos: number; path: string }) => {
        if (result?.path) {
          const extension = getFileExtension(result.path);
          console.log('test:extension:', extension);
          localPath = localPath + extension;
          Services.ms
            .saveFromLocal({
              targetPath: localPath,
              localPath: result.path,
            })
            .then(() => {
              onVoiceRecordEnd?.({
                localPath,
                duration: result.pos / 1000,
              });
            })
            .catch((error) => {
              console.warn('test:startRecordAudio:save:error', error);
            });
        }
      })
      .catch((error) => {
        console.warn('test:stopRecordAudio:error:', error);
      });
  }, [chatId, onVoiceRecordEnd]);
  const onLongPressMessageBubble = React.useCallback(
    (data: any) => {
      sendEventFromChat({
        eventType: 'ActionMenuEvent',
        action: 'long_press_message_bubble',
        params: { ...data, convId: chatId, convType: chatType },
      });
    },
    [chatId, chatType]
  );
  const onSendMessage = React.useCallback((message: ChatMessage) => {
    sendEventFromChat({
      eventType: 'DataEvent',
      action: 'on_send_before',
      params: { message },
    });
  }, []);
  const onSendMessageEnd = React.useCallback((message: ChatMessage) => {
    console.log('test:onSendMessageEnd:', message);
    sendEventFromChat({
      eventType: 'DataEvent',
      action: 'on_send_result',
      params: { message },
    });
  }, []);
  const onUpdateReadCount = React.useCallback((unreadCount: number) => {
    sendEvent({
      eventType: 'DataEvent',
      action: 'update_all_count',
      params: { count: unreadCount },
      eventBizType: 'conversation',
      senderId: 'Chat',
    });
  }, []);

  const createConversationIfNotExisted = React.useCallback(() => {
    sendEventFromChat({
      eventType: 'DataEvent',
      action: 'exec_create_conversation',
      params: {
        convId: chatId,
        convType: chatType as number as ChatConversationType,
      },
    });
  }, [chatId, chatType]);

  const updateAllUnreadCount = React.useCallback(() => {
    client.chatManager
      .getUnreadCount()
      .then((result) => {
        if (result !== undefined) {
          onUpdateReadCount?.(result);
        }
      })
      .catch((error) => {
        console.warn('test:error:', error);
      });
  }, [client.chatManager, onUpdateReadCount]);

  const clearRead = React.useCallback(() => {
    client.chatManager
      .markAllMessagesAsRead(chatId, chatType as number as ChatConversationType)
      .then(() => {
        sendEventFromChat({
          eventType: 'DataEvent',
          action: 'update_conversation_read_state',
          params: {
            convId: chatId,
            convType: chatType as number as ChatConversationType,
          },
        });

        updateAllUnreadCount();
      })
      .catch((error) => {
        console.warn('test:error', error);
      });
  }, [chatId, chatType, client.chatManager, updateAllUnreadCount]);

  const init = React.useCallback(() => {
    // notify create conversation if not existed.
    createConversationIfNotExisted();
    clearRead();
  }, [clearRead, createConversationIfNotExisted]);

  const addListeners = React.useCallback(() => {
    const sub = DeviceEventEmitter.addListener(
      'DataEvent' as DataEventType,
      async (event) => {
        const { action, params } = event as {
          eventBizType: BizEventType;
          action: DataActionEventType;
          senderId: string;
          params: any;
          timestamp?: number;
        };
        switch (action) {
          case 'chat_open_camera':
            Services.ms
              .openCamera({})
              .then((result) => {
                console.log('openCamera:', Platform.OS, result);
                chatRef.current?.sendImageMessage([
                  {
                    name: result?.name ?? '',
                    localPath: result?.uri ?? '',
                    fileSize: result?.size ?? 0,
                    imageType: result?.type ?? '',
                    width: result?.width ?? 0,
                    height: result?.height ?? 0,
                    onResult: (r) => {
                      console.log('openCamera:result:', r);
                    },
                  },
                ]);
              })
              .catch((error) => {
                console.warn('error:', error);
              });
            break;
          case 'chat_open_document':
            {
              const ret = await Services.ps.hasMediaLibraryPermission();
              if (ret === false) {
                await Services.ps.requestMediaLibraryPermission();
              }
              Services.ms
                .openDocument({})
                .then((result) => {
                  console.log('openDocument:', Platform.OS, result);
                  chatRef.current?.sendFileMessage({
                    localPath: result?.uri ?? '',
                    fileSize: result?.size ?? 0,
                    displayName: result?.name,
                    onResult: (result) => {
                      console.log('openDocument:result', result);
                    },
                  });
                })
                .catch((error) => {
                  console.warn('error:', error);
                });
            }

            break;
          case 'chat_open_media_library':
            Services.ms
              .openMediaLibrary({ selectionLimit: 1, mediaType: 'all' })
              .then((result) => {
                console.log('openMediaLibrary:', Platform.OS, result);
                if (result === undefined || result.length === 0) {
                  return;
                }
                console.log('openMediaLibrary:', Platform.OS, result[0]?.type);
                const type = result[0]?.type;
                if (type?.includes('video')) {
                  chatRef.current?.sendVideoMessage({
                    localPath: result[0]?.uri ?? '',
                    fileSize: result[0]?.size ?? 0,
                    displayName: result[0]?.name ?? '',
                    duration: 0,
                    width: result[0]?.width ?? 0,
                    height: result[0]?.height ?? 0,
                    onResult: (result) => {
                      console.log('openMediaLibrary:result:', result);
                    },
                  });
                } else {
                  chatRef.current?.sendImageMessage(
                    result.map((value) => {
                      return {
                        name: value?.name ?? '',
                        localPath: value?.uri ?? '',
                        fileSize: value?.size ?? 0,
                        imageType: value?.type ?? '',
                        width: value?.width ?? 0,
                        height: value?.height ?? 0,
                        onResult: (result) => {
                          console.log('openMediaLibrary:result:', result);
                        },
                      };
                    })
                  );
                }
              })
              .catch((error) => {
                console.warn('error:', error);
              });
            break;
          case 'delete_local_message':
            chatRef.current?.deleteLocalMessage({
              ...params,
              onResult: (result) => {
                console.log('delete_local_message:', result);
              },
            });
            break;
          case 'resend_message':
            chatRef.current?.resendMessage({
              ...params,
              onResult: (result) => {
                console.log('resend_message:', result);
              },
            });
            break;
          case 'recall_message':
            chatRef.current?.recallMessage({
              ...params,
              onResult: (result) => {
                if (result.message) {
                  const msg = result.message as ChatMessage;
                  const content =
                    msg.from === currentId
                      ? `You have recall a message`
                      : `${msg.from} has recall a message`;
                  const tip = { ...msg } as ChatMessage;
                  tip.attributes = {
                    type: 'recall',
                    recall_from: msg.from,
                    recall_content: content,
                  };
                  tip.status = ChatMessageStatus.SUCCESS;
                  chatRef.current?.insertMessage({ msg: tip });
                  onSendMessageEnd(tip);
                }
              },
            });
            break;
          case 'on_recall_message':
            {
              const { tip } = params;
              messageBubbleListRef.current?.delMessage({
                localMsgId: tip.localMsgId,
              });
              chatRef.current?.insertMessage({ msg: tip });
              onSendMessageEnd(tip);
            }
            break;
          default:
            break;
        }
      }
    );
    return () => {
      sub.remove();
    };
  }, [currentId, onSendMessageEnd]);

  React.useEffect(() => {
    const load = () => {
      console.log('test:load:', ChatScreen.name);
      const unsubscribe = addListeners();
      init();
      return {
        unsubscribe: unsubscribe,
      };
    };
    const unload = (params: { unsubscribe: () => void }) => {
      console.log('test:unload:', ChatScreen.name);
      params.unsubscribe();
    };

    const res = load();
    return () => unload(res);
  }, [addListeners, init]);

  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment
        propsRef={chatRef}
        screenParams={route.params as any}
        messageBubbleList={{
          bubbleList: MessageBubbleListFragment,
          bubbleListProps: {
            TextMessageItem: MyTextMessageBubble,
            VideoMessageItem: MyVideoMessageBubble,
            FileMessageItem: MyFileMessageBubble,
            showTimeLabel: showTimeLabel,
            // style: { backgroundColor: 'yellow' },
          } as MessageBubbleListProps,
          bubbleListRef: messageBubbleListRef,
        }}
        onUpdateReadCount={onUpdateReadCount}
        onClickMessageBubble={onClickMessageBubble}
        onClickInputMoreButton={onClickInputMoreButton}
        onPressInInputVoiceButton={onPressInInputVoiceButton}
        onPressOutInputVoiceButton={onPressOutInputVoiceButton}
        onLongPressMessageBubble={onLongPressMessageBubble}
        onSendMessage={onSendMessage}
        onSendMessageEnd={onSendMessageEnd}
        onVoiceRecordEnd={onVoiceRecordEnd}
      />
    </ScreenContainer>
  );
}
