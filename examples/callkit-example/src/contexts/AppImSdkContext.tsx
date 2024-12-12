import type { ChatClient } from 'react-native-agora-chat';
import {
  UIKitChatSdkContext,
  useChatSdkContext,
} from 'react-native-chat-uikit';

export class AppChatSdkContext extends UIKitChatSdkContext {
  constructor(params: { client: ChatClient }) {
    super(params.client);
  }
}

export function useAppChatSdkContext(): AppChatSdkContext {
  const sdk = useChatSdkContext() as AppChatSdkContext;
  if (!sdk) throw Error('IMSDKContext is not provided');
  return sdk;
}
