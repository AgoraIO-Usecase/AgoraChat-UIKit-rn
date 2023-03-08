import * as React from 'react';
import {
  DeviceEventEmitter,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Divider,
  getScaleFactor,
  LoadingButton,
  Switch,
  useManualCloseDialog,
} from 'react-native-chat-uikit';

import { useAppI18nContext } from '../contexts/AppI18nContext';
import {
  type CreateGroupSettingsEventType,
  ContactListEvent,
  CreateGroupSettingsEvent,
} from '../events';
import { type sendEventProps, sendEvent } from '../events2/sendEvent';

const sendGroupSettingEvent = (
  params: Omit<sendEventProps, 'senderId' | 'timestamp' | 'eventBizType'>
) => {
  sendEvent({
    ...params,
    senderId: 'GroupSetting',
    eventBizType: 'setting',
  } as sendEventProps);
};

export const CreateGroupSettings = () => {
  console.log('test:CreateGroupSettings:');
  const [isPublic, setIsPublic] = React.useState(true);
  const [isInvite, setIsInvite] = React.useState(true);
  const sf = getScaleFactor();
  const { contactList } = useAppI18nContext();
  const { width: screenWidth } = useWindowDimensions();
  const { manualClose } = useManualCloseDialog();

  const [disabled] = React.useState(false);
  const [buttonState, setButtonState] = React.useState<'loading' | 'stop'>(
    'stop'
  );

  const onIsPublic = React.useCallback((is: boolean) => {
    setIsPublic(is);
  }, []);
  const onIsInvite = React.useCallback((is: boolean) => {
    setIsInvite(is);
  }, []);

  const startCreateNewGroup = React.useCallback(
    (state: 'stop' | 'loading') => {
      if (state === 'loading') {
        return;
      }
      setButtonState('loading');
      DeviceEventEmitter.emit(CreateGroupSettingsEvent, {
        type: 'create_new_group' as CreateGroupSettingsEventType,
        params: {
          isInvite: isInvite,
          isPublic: isPublic,
        },
      });
    },
    [isInvite, isPublic]
  );

  React.useEffect(() => {
    const sub = DeviceEventEmitter.addListener(ContactListEvent, (event) => {
      if (event.type !== 'create_group_result') {
        return;
      }
      const eventParams = event.params;
      setButtonState('stop');
      const chatId = eventParams.id;
      const chatType = eventParams.type;
      if (eventParams.result === true) {
        manualClose()
          .then(() => {
            sendGroupSettingEvent({
              eventType: 'DataEvent',
              action: 'create_group_result_success',
              params: { chatId, chatType },
            });
          })
          .catch((error) => {
            console.warn('test:sendGroupSettingEvent:error:', error);
          });
      } else {
        manualClose()
          .then(() => {
            sendGroupSettingEvent({
              eventType: 'AlertEvent',
              action: 'create_group_result_fail',
              params: { chatId, chatType, content: 'Create Group Failed.' },
            });
          })
          .catch((error) => {
            console.warn('test:sendGroupSettingEvent:error:', error);
          });
      }
    });
    return () => {
      sub.remove();
    };
  }, [isInvite, isPublic, manualClose]);

  return (
    <View
      style={{
        width: sf(screenWidth - 40),
      }}
      pointerEvents="box-none"
    >
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: sf(12),
          flexGrow: 1,
        }}
      >
        <Text
          style={{
            color: '#666666',
            fontSize: sf(14),
            fontWeight: '600',
            lineHeight: sf(18),
          }}
        >
          {contactList.groupSetting.groupSetting}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: sf(12),
        }}
      >
        <Text
          style={{
            color: '#333333',
            fontSize: sf(15),
            fontWeight: '600',
            lineHeight: sf(20),
          }}
        >
          {contactList.groupSetting.publicGroup}
        </Text>
        <Switch
          value={isPublic}
          onChangeValue={() => {
            onIsPublic(!isPublic);
          }}
          thumbColor="white"
          inactiveThumbColor="white"
          size={sf(28)}
        />
      </View>
      <Divider height={sf(0.25)} marginLeft={1} marginRight={1} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: sf(12),
        }}
      >
        <Text
          style={{
            color: '#333333',
            fontSize: sf(15),
            fontWeight: '600',
            lineHeight: sf(20),
          }}
        >
          {contactList.groupSetting.memberInvite}
        </Text>
        <Switch
          value={isInvite}
          onChangeValue={() => {
            onIsInvite(!isInvite);
          }}
          thumbColor="white"
          inactiveThumbColor="white"
          size={sf(28)}
        />
      </View>
      <Divider height={sf(0.25)} marginLeft={1} marginRight={1} />
      <View
        style={{
          paddingVertical: sf(20),
        }}
      >
        <LoadingButton
          disabled={disabled}
          content={contactList.groupSetting.createGroup}
          style={{ height: sf(48), borderRadius: sf(24) }}
          state={buttonState}
          onChangeState={(state) => {
            startCreateNewGroup(state);
          }}
        />
      </View>
    </View>
  );
};
