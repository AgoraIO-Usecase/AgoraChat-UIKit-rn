_中文 | [English](./README.md)_

---

# 快速开始

带你快速的完成项目的编译和运行。

## 环境准备

- 操作系统：
  - MacOS 10.15.7 或以上版本
- 工具集合：
  - Xcode 13.4 或以上版本 （如果开发 iOS 平台引用）
  - Android studio 2021.3.1 或以上版本 （如果开发 Android 平台应用）（简称 as）
  - Visual Studio Code latest （简称 vscode）
- 编译运行环境：
  - Java JDK 1.8.0 或以上版本 （推荐使用 Android studio 自带）
  - Objective-C 2.0 或以上版本 （推荐使用 Xcode 自带）
  - Typescript 4.0 或以上版本
  - Nodejs 16.18.0 或以上版本 （推荐使用 brew 安装）
  - yarn 1.22.19 或以上版本 （推荐使用 brew 安装）
  - React-Native 0.63.5 以上
  - npm 以及相关工具 （**不推荐**，相关问题请自行解决）
  - expo 6.0.0 或以上版本

## 源码下载

[下载地址](https://github.com/easemob/react-native-chat-library/)

```sh
git clone git@github.com:easemob/react-native-chat-library.git
```

## 项目的结构

这是一个多包管理项目，通过 `lerna` 和 `yarn workspace` 实现管理。

- `example`: 较为完整的示例项目，用于演示和测试开发的包。
- `examples/uikit-example`: uikit 示例项目（待开发）
- `examples/callkit-example`: callkit 示例项目，主要针对 `callkit sdk` 进行演示。
- `packages/react-native-chat-uikit`: uikit 项目
- `packages/react-native-chat-callkit`: callkit 项目

**注意** 项目运行的命令一般都是在项目根目录，而不是对应的包目录或者示例目录。

## 编译和运行

#### 项目初始化

1. 使用 `vscode` 打开项目 `react-native-chat-library`
2. 使用 `terminal` 初始化项目 `yarn`
3. 如果是第一次项目初始化，还需要执行命令 `yarn run generate-source-env`，生成相应的文件。例如：`env.ts`。

**注意** `yarn` 会执行额外的命令，对于不了解命令的开发者，如果需要使用 `npm` 命令替换，需要了解更加相信的内容。
**注意** 在创建该项目的时候，脚手架已经预置了部分 `yarn` 相关的命令，所以，推荐使用 `yarn` 完成绝大部分工作。
**注意** 由于 `example` 使用了 `firebase cloud message (fcm)` 相关内容，如果用户需要使用相关内容，需要设置对应的文件（ios 平台需要 GoogleService-Info.plist， android 平台需要 google-services.json），如果不需要则删除相关内容即可。

#### 通用编译

操作步骤如下：

1.  使用 `terminal` 切换到目录到 `example`
2.  执行命令 `yarn run ios` 命令编译并运行 `iOS` 应用
3.  执行命令 `yarn run android` 命令编译并运行 `Android` 应用

**注意** 不推荐该模式进行编译。
**修改命令** 请参考 `example/package.json` 相关内容。
**参考** 编译和运行命令更多知识请参考 `expo` 相关内容。

#### 通用运行

在开发模式下运行应用，需要额外的本地服务，它可以动态检测到文件源码的修改，动态的进行调试。

1. 使用 `terminal` 工具，切换目录到 `cd example/ios`
2. 使用 `terminal` 工具，执行 `yarn run start` 命令启动服务。

#### iOS 平台

**<span style="color:orange">编译和构建该项目</span>**

在编译阶段，`iOS` 平台需要执行 `pod install` 命令生成 Xcode `xcworkspace` 工程文件。

1. 使用 `terminal` 工具，切换目录到 `cd example/ios`
2. 使用 `terminal` 工具，执行 `pod install` 生成 `example/ios/example.xcworkspace`.
3. 使用 `Xcode` 工具，打开工程文件 `example/ios/example.xcworkspace`
4. 如果使用模拟器，则需要选择 `iOS` 12.4 或者以下版本
5. 如果使用真机，真机需要启用开发者模式，工程项目中需要设置 `singing & capabilities` 相关内容
6. 使用 `Xcode` 工具，执行编译操作。

**注意** 对于不使用 `Xcode` 编译的开发者，可以使用官方推荐的方式编译，如果出现问题一般的不好查找问题原因。
**注意** 自动启动的是 `react-native` 原生的服务，而不是 `expo` 服务，会报错。只需要关闭该服务即可。

**<span style="color:orange">运行该项目</span>**

使用 `expo` 工具提供的命令，启动本地服务，参考 `通用运行` 章节。

**注意** 如果运行的应用没有正确加载，需要刷新页面，或者关闭应用重新启动。对于报错问题一般可以通过相应的提示解决。

#### Android 平台

**<span style="color:orange">编译和构建该项目</span>**

在编译阶段，`Android` 平台需要执行 `sync` 初始化项目。

1. 启动 `android studio (as)` 工具, 打开工程文件 `example/android`，
2. 点击 `sync project with gradle files` 按钮执行 `初始化` 操作，
3. 如果使用模拟器，请选择或者创建 6.0 版本或以上版本的模拟器，
4. 如果是真机，需要开启设备的开发者模式，
5. 当 `sync` 成功后，点击 `run app` 按钮，执行编译和运行该项目。

**注意** 如果是第一次使用 `as`, 可能需要大量下载，等待时间较长。
**注意** 如果遇到 `timeout` 可能是使用了 `m1/m2` arm64 版本的 MacOS 设备导致的，需要使用 `terminal` 执行 `open -a /Applications/Android\ Studio.app` 命令启动 `as`。

**<span style="color:orange">运行该项目</span>**

使用 `expo` 工具提供的命令，启动本地服务，参考 `通用运行` 章节。

**注意** 如果运行的应用没有正确加载，需要刷新页面，或者关闭应用重新启动。对于报错问题一般可以通过相应的提示解决。
**注意** `Android 平台的设备，需要数据转发，该数据转发的命令是 `adb reverse tcp:8081 tcp:8081`。由于 `example`使用`expo` 工具，它帮忙做了，所以不需要手动操作。

## 参数设置

在项目初始化之后，会在 `example` 项目中生成 `env.ts` 的本地配置文件。

```typescript
export const test = false; // test mode or no
export const appKey = ''; // from register console
export const id = ''; // default user id
export const ps = ''; // default password or token
export const accountType = 'agora'; // 'easemob' or 'agora'
```

- `test`: 当为`true`的时候，页面会切换到单纯的组件测试模式，可以不用执行登录、退出等远程操作,就可以完成本地组件的演示。默认为 `false`
- `appKey`: 应用的唯一标识，一般通过网站后台获取
- `id`: 登录用户的 id，一般通过注册或者网站后台获取
- `ps`: 登录用户的 秘钥，一般通过注册或者网站后台获取
- `accountType`: 可以切换国内外登录, 默认为 `agora`

---

# 在已有项目中集成 UIKIT

使用 `uikit` 的方式主要有这几种：

1. 创建全新项目，集成 `uikit`。 这种情况，需要注意开发环境的问题。可能由于跨大版本导致编译和运行报错。
2. 在现有项目中，集成 `uikit`。 这种情况，需要注意现有项目版本 和 `uikit` 项目的版本，以及依赖版本的兼容性。
3. 修改 `example` 项目，完成产品开发。这种情况，几乎没有开发环境问题，但是需要学习和了解 `example` 的架构思维，才能更好的完成应用开发。

下面进行最常见的方式，已有项目中集成 `uikit` 的介绍。

## 安装 `uikit` 到现有项目中

```sh
cd your_project_root
yarn add react-native-chat-uikit
```

开发、编译和运行等请参考相关章节，下面以集成聊天页面为例进行说明。

## 快速集成聊天页面

聊天页面由多个组件组成。主要包括：消息气泡列表组件、输入组件。 输入组件由表情组件、语音组件、扩展组件组成。

<img src=https://github.com/easemob/react-native-chat-library/tree/dev/docs/typical/ui_chat_struct_1.jpg width="50%">

<!-- <img src=https://img-blog.csdnimg.cn/20200822014538211.png width=60% /> -->

![img](./docs/typical/ui_chat_struct_1.jpg){: width="100px" height="100px"}

## 最简单的集成方式

1. 在入口方法中，完成 `uikit` 的初始化
2. 在目标页面中使用 `ChatFragment` 组件

示例代码：

```typescript
import * as React from 'react';
import { ChatFragment, ScreenContainer } from 'react-native-chat-uikit';
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment screenParams={{ chatId, chatType }} />
    </ScreenContainer>
  );
}
```

## 设置个性化的聊天组件

聊天组件带有很多参数和配置，可以更具需要进行设置，达到需要的效果。 对于更多更高的自定义可以参考源码实现。

#### 聊天组件提供的接口

聊天组件 `ChatFragment` 提供了除去命令消息之外的所有消息的发送方法，发送消息会默认加载到聊天气泡列表页面。也提供加载历史消息的方法。
如果想要使用这些方法，需要在聊天属性里面设置 `propsRef` 参数。

```typescript
export type ChatFragmentRef = {
  sendImageMessage: (
    params: {
      name: string;
      localPath: string;
      fileSize: string;
      imageType: string;
      width: number;
      height: number;
    }[]
  ) => void;
  sendVoiceMessage: (params: {
    localPath: string;
    fileSize?: number;
    duration?: number;
  }) => void;
  sendTextMessage: (params: { content: string }) => void;
  sendCustomMessage: (params: { data: CustomMessageItemType }) => void;
  sendFileMessage: (params: {
    localPath: string;
    fileSize?: number;
    displayName?: string;
  }) => void;
  sendVideoMessage: (params: {
    localPath: string;
    fileSize?: number;
    displayName?: string;
    duration: number;
    thumbnailLocalPath?: string;
    width?: number;
    height?: number;
  }) => void;
  sendLocationMessage: (params: {
    address: string;
    latitude: string;
    longitude: string;
  }) => void;
  loadHistoryMessage: (msgs: ChatMessage[]) => void;
};
```

#### 聊天组件提供的属性

聊天组件主要提供了常用的属性。例如：设置自定义聊天气泡列表组件，各种按钮或者状态的回调。

```typescript
type ChatFragmentProps = {
  propsRef?: React.RefObject<ChatFragmentRef>;
  screenParams: {
    params: {
      chatId: string;
      chatType: number;
    };
  };
  messageBubbleList?: {
    MessageBubbleListP: React.ForwardRefExoticComponent<
      MessageBubbleListProps & React.RefAttributes<MessageBubbleListRef>
    >;
    MessageBubbleListPropsP: MessageBubbleListProps;
    MessageBubbleListRefP: React.RefObject<MessageBubbleListRef>;
  };
  customMessageBubble?: {
    CustomMessageRenderItemP: React.FunctionComponent<
      MessageItemType & { eventType: string; data: any }
    >;
  };
  onUpdateReadCount?: (unreadCount: number) => void;
  onClickMessageBubble?: (data: MessageItemType) => void;
  onLongPressMessageBubble?: (data: MessageItemType) => void;
  onClickInputMoreButton?: () => void;
  onPressInInputVoiceButton?: () => void;
  onPressOutInputVoiceButton?: () => void;
  onSendMessage?: (message: ChatMessage) => void;
  onSendMessageEnd?: (message: ChatMessage) => void;
  onVoiceRecordEnd?: (params: { localPath: string; duration: number }) => void;
};
```

#### 聊天气泡列表组件提供的接口

聊天气泡列表组件 `MessageBubbleList` 提供了滚动接口以及加载消息接口。可以直接调用 `addMessage` 方法加载消息。也可以通过操控 `ChatFragment` 组件间接添加消息。

```typescript
export type MessageBubbleListRef = {
  scrollToEnd: () => void;
  scrollToTop: () => void;
  addMessage: (params: {
    msgs: MessageItemType[];
    direction: InsertDirectionType;
  }) => void;
  updateMessageState: (params: {
    localMsgId: string;
    result: boolean;
    reason?: any;
    item?: MessageItemType;
  }) => void;
};
```

#### 聊天气泡列表组件提供的属性

聊天气泡列表组件主要进行消息展示，目前提供自定义消息气泡的样式，以及下拉刷新请求历史消息的回调。如果没有提供则使用默认样式。目前只有 文本、图片、语音提供了默认样式。

```typescript
export type MessageBubbleListProps = {
  /**
   * Click the message list, not the message item.
   */
  onPressed?: () => void;
  onRequestHistoryMessage?: (params: { earliestId: string }) => void;
  TextMessageItem?: ListRenderItem<TextMessageItemType>;
  ImageMessageItem?: ListRenderItem<ImageMessageItemType>;
  VoiceMessageItem?: ListRenderItem<VoiceMessageItemType>;
  FileMessageItem?: ListRenderItem<FileMessageItemType>;
  LocationMessageItem?: ListRenderItem<LocationMessageItemType>;
  VideoMessageItem?: ListRenderItem<VideoMessageItemType>;
  CustomMessageItem?: ListRenderItem<CustomMessageItemType>;
};
```

#### 聊天属性：控制器

`propsRef` 该属性主要可以主动调用 `ChatFragment` 的相关方法。

**知识点** 对于 `React-Native` 技术框架，UI 组件一般提供几种方式决定组件行为。

1. 使用属性来初始化或者动态更新组件样式
2. 使用属性回调通知上层使用者状态的变化
3. 使用控制器（ref）控制子组件的主动行为

例如：在录制语音之后，发送语音消息

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment
        screenParams={{ chatId, chatType }}
        onVoiceRecordEnd={(params) => {
          chatRef.current.sendVoiceMessage(params);
        }}
      />
    </ScreenContainer>
  );
}
```

例如：在选择好图片之后，发送图片消息

```typescript
import type { BizEventType, DataActionEventType } from '../events';
import { DataEventType } from 'react-native-chat-uikit';
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  React.useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'DataEvent' as DataEventType,
      (event) => {
        const { action } = event as {
          eventBizType: BizEventType;
          action: DataActionEventType;
          senderId: string;
          params: any;
          timestamp?: number;
        };
        switch (action) {
          case 'chat_open_media_library':
            Services.ms
              .openMediaLibrary({ selectionLimit: 1 })
              .then((result) => {
                chatRef.current?.sendImageMessage(result as any);
              })
              .catch((error) => {
                console.warn('error:', error);
              });
            break;

          default:
            break;
        }
      }
    );
    return () => {
      sub.remove();
    };
  }, [addListeners]);
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment screenParams={{ chatId, chatType }} />
    </ScreenContainer>
  );
}
```

**说明** 需要在初始化的时候设置好模态窗口管理组件。如果缺省该参数，可能无法收到相应的事件通知。

```typescript
import { ModalPlaceholder } from './events';
export default function App() {
  return (
    <React.StrictMode>
      <GlobalContainer
        option={{
          appKey: appKey,
          autoLogin: autoLogin.current,
          debugModel: true,
        }}
        ModalComponent={() => <ModalPlaceholder />}
      />
    </React.StrictMode>
  );
}
```

#### 聊天属性：聊天气泡列表组件

当默认聊天气泡不能满足自定义需求的时候，可以自行设计聊天气泡样式。

假设 `MessageBubbleList` 是自定义的聊天气泡列表组件。

```typescript
import type { MessageBubbleListProps } from '../fragments/MessageBubbleList';
import MessageBubbleList from '../fragments/MessageBubbleList';
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment
        screenParams={{ chatId, chatType }}
        messageBubbleList={{
          MessageBubbleListP: MessageBubbleList,
          MessageBubbleListPropsP: {
            onPressed: () => {},
          } as MessageBubbleListProps,
          MessageBubbleListRefP: messageBubbleListRefP as any,
        }}
      />
    </ScreenContainer>
  );
}
```

**说明** 由于 `MessageBubbleList` 实现源码太多，如有需要请参考 [here](https://github.com/easemob/react-native-chat-library/tree/dev/example/src/components/CustomMessageBubble.tsx)

#### 聊天属性：自定义消息组件

假如，你想要自定义一个订单消息，可以使用 `自定义类型` 组件 实现 自定义消息（订单消息） 的显示、发送和接收。

自定义消息组件的数据源需要以 `MessageItemType` 为基础类型进行扩展。
自定义消息组件的渲染部分需要遵守 `FunctionComponent` 组件规则。

```typescript
import { CustomMessageRenderItem } from '../components/CustomMessageBubble';
import type { MessageBubbleListProps } from '../fragments/MessageBubbleList';
import MessageBubbleList from '../fragments/MessageBubbleList';
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment
        screenParams={{ chatId, chatType }}
        customMessageBubble={{
          CustomMessageRenderItemP: CustomMessageRenderItem,
        }}
      />
    </ScreenContainer>
  );
}
```

**说明** 由于 `CustomMessageRenderItem` 实现源码太多，如有需要请参考 [here](https://github.com/easemob/react-native-chat-library/tree/dev/example/src/components/CustomMessageBubble.tsx)

#### 聊天属性：未读数通知

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment
        screenParams={{ chatId, chatType }}
        onUpdateReadCount={(unreadCount: number) => {
          // TODO: Broadcast no reading notification.
        }}
      />
    </ScreenContainer>
  );
}
```

#### 聊天属性：点击聊天气泡通知

典型应用：播放语音消息，显示图片预览。

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment
        screenParams={{ chatId, chatType }}
        onClickMessageBubble={(data: MessageItemType) => {
          // TODO: If it is a voice message, it plays it, if it is a picture message, it previews it.
        }}
      />
    </ScreenContainer>
  );
}
```

#### 聊天属性：长按消息气泡通知

典型应用：显示消息上下文菜单，进行消息转发、消息撤销等操作。

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment
        screenParams={{ chatId, chatType }}
        onLongPressMessageBubble={() => {
          // TODO: Displays the context menu. For example, message forwarding, message deletion, message resending, etc.
        }}
      />
    </ScreenContainer>
  );
}
```

#### 聊天属性：点击扩展按钮通知

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment
        screenParams={{ chatId, chatType }}
        onClickInputMoreButton={() => {
          // TODO: Open drawer menu, pop up list, for example: open media library, open document library, etc.
        }}
      />
    </ScreenContainer>
  );
}
```

#### 聊天属性：按下语音按钮通知

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment
        screenParams={{ chatId, chatType }}
        onPressInInputVoiceButton={() => {
          // TODO: The voice recording starts.
        }}
      />
    </ScreenContainer>
  );
}
```

#### 聊天属性：抬起语音按钮通知

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment
        screenParams={{ chatId, chatType }}
        onPressOutInputVoiceButton={() => {
          // TODO: The voice recording stops.
        }}
      />
    </ScreenContainer>
  );
}
```

#### 聊天属性：发送消息通知

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment
        screenParams={{ chatId, chatType }}
        onSendMessage={(message: ChatMessage) => {
          // TODO: Update the message.
        }}
      />
    </ScreenContainer>
  );
}
```

#### 聊天属性：发送消息完成通知

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment
        screenParams={{ chatId, chatType }}
        onSendMessageEnd={(message: ChatMessage) => {
          // TODO: Update message status, success or failure.
        }}
      />
    </ScreenContainer>
  );
}
```

#### 聊天属性：语音录制结束通知

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragment
        screenParams={{ chatId, chatType }}
        onVoiceRecordEnd={(params: any) => {
          // TODO: Voice files are processed and voice messages are sent.
        }}
      />
    </ScreenContainer>
  );
}
```

---

## 快速集成会话列表

`ConversationListFragment` 最简单的集成方式:

```typescript
import * as React from 'react';
import {
  ConversationListFragment,
  ScreenContainer,
} from 'react-native-chat-uikit';
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ConversationListFragment />
    </ScreenContainer>
  );
}
```

### 会话列表提供的方法

会话组件提供了创建、更新、已读、扩展属性的方法。

```typescript
export type ConversationListFragmentRef = {
  update: (message: ChatMessage) => void;
  create: (params: { convId: string; convType: ChatConversationType }) => void;
  updateRead: (params: {
    convId: string;
    convType: ChatConversationType;
  }) => void;
  updateExtension: (params: {
    convId: string;
    convType: ChatConversationType;
    ext?: any; // json object.
  }) => void;
};
```

### 会话列表提供的属性

会话列表提供了点击、长按、未读数、排序策略、自定义样式的属性。

```typescript
export type ConversationListFragmentProps = {
  propsRef?: React.RefObject<ConversationListFragmentRef>;
  onLongPress?: (data?: ItemDataType) => void;
  onPress?: (data?: ItemDataType) => void;
  onData?: (data: ItemDataType[]) => void;
  onUpdateReadCount?: (unreadCount: number) => void;
  sortPolicy?: (a: ItemDataType, b: ItemDataType) => number;
  RenderItem?: ItemComponent;
  /**
   * If `RenderItem` is a custom component and uses side-slip mode, you need to inform the width of the side-slide component.
   */
  RenderItemExtraWidth?: number;
};
```

#### 设置个性化的会话列表

#### 会话列表属性：点击回调

点击会话列表项，典型应用：进入聊天页面。

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ConversationListFragment
        onPress={(data?: ItemDataType) => {
          // todo: enter to chat detail screen.
        }}
      />
    </ScreenContainer>
  );
}
```

#### 会话列表属性：长按回调

长按聊天列表项，典型应用：显示上下文菜单。

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ConversationListFragment
        onLongPress={(data?: ItemDataType) => {
          // todo: show context menu.
        }}
      />
    </ScreenContainer>
  );
}
```

#### 会话列表属性：更新未读数回调

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ConversationListFragment
        onUpdateReadCount={(unreadCount: number) => {
          // todo: show unread message count.
        }}
      />
    </ScreenContainer>
  );
}
```

#### 会话列表属性：排序策略

默认排序是对 `convId` 进行排序，如果需要可以自行设置。典型应用：会话置顶。

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ConversationListFragment
        sortPolicy={(a: ItemDataType, b: ItemDataType) => {
          if (a.key > b.key) {
            return 1;
          } else if (a.key < b.key) {
            return -1;
          } else {
            return 0;
          }
        }}
      />
    </ScreenContainer>
  );
}
```

#### 会话列表属性：自定义样式

可以自定义会话列表项的显示样式。
**注意** 如果激活侧滑功能，需要设置侧滑组件的宽度。

```typescript
export default function ChatScreen(): JSX.Element {
  const chatId = 'xxx';
  const chatType = 0;
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ConversationListFragment
        RenderItem={(props) => {
          return <View />;
        }}
      />
    </ScreenContainer>
  );
}
```

---

# 系统介绍

该多包项目主要包括了 `uikit` 和 `example` 。其中 `uikit` 主要提供了即时通讯的基础工具， `example` 主要实现了对应功能的演示。

**说明** `react-native-chat-uikit` 是 `npm`包的名称，原名为 `Agora Uikit SDK`, 这里简称 `uikit`。 `Agora Uikit SDK` 依赖 `Agora Chat SDK`（包名为 `react-native-agora-chat`）.

## example 项目

`example` 项目主要包括 `路由和导航（页面切换相关）`、`初始化设置`、`登录和退出`、`联系人管理`、`群组管理`、`会话管理`、`我的设置模块` 的演示。

## uikit 项目

`uikit` 项目主要包括 `UI基础组件`、`国际化工具`、`主题工具`、`数据共享工具`、`媒体服务`、`存储服务` 等。

## 项目初始化

初始化是使用 `uikit` 的前提，并且是必须要做的。

初始化部分包括了很多重要参数，决定后续应用运行的行为。

初始化组件是 `GlobalContainer`, 它提供了参数列表 `GlobalContainerProps`。

```typescript
export type GlobalContainerProps = React.PropsWithChildren<{
  option: {
    appKey: string;
    autoLogin: boolean;
  };
  localization?: StringSetContextType | undefined;
  theme?: ThemeContextType | undefined;
  sdk?: ChatSdkContextType | undefined;
  header?: HeaderContextType | undefined;
  services?: {
    clipboard?: ClipboardService | undefined;
    media?: MediaService | undefined;
    notification?: NotificationService | undefined;
    permission?: PermissionService | undefined;
    storage?: LocalStorageService | undefined;
    dir?: DirCacheService | undefined;
  };
  onInitialized?: () => void;
  ModalComponent?: React.FunctionComponent;
}>;
```

参数说明:

- option:
  - appKey: The application id from the console.
  - autoLogin: Whether to use automatic login.
- localization: Application language internationalization. English is supported by default.
- theme: Apply the theme. The system provides the 'light' version by default.
- sdk: Chat SDK.
- header: Status bar Settings for mobile devices.
- services:
  - clipboard: Paste board service. 'uikit' provides the default version.
  - media: Media services. 'uikit' provides the default version.
  - notification: Notification service. 'uikit' provides the default version.
  - permission: Apply permission service. 'uikit' provides the default version.
  - storage: Storage service. Currently support 'key-value' persistent storage. 'uikit' provides the default version.
  - dir: Directory service. 'uikit' provides the default version.
- onInitialized: Called after uikit is initialized.
- ModalComponent: A custom modal system component that manages all modal Windows.

很多参数提供了默认选项，如果不设置则采用系统默认参数。

缺省参数初始化示例:

```typescript
export default function App() {
  return <GlobalContainer option={{ appKey: 'test#demo', autoLogin: false }} />;
}
```

[sample code](https://github.com/easemob/react-native-chat-library/tree/dev/example/src/App.tsx)

## 路由和导航器

页面的切换离不开导航器或者路由的使用。

它不属于 `uikit` 的一部分。属于 `example` 的组成部分。 对于导航器的选择也有很多种，这里使用了常见的 `react-navigation` 组件库。

它的相关用法，可以参考 `example` 项目。 也可以参考官方文档 [skip to official website](https://reactnavigation.org/)

## 模态窗口管理

模态窗口是一类特殊的窗口，只有该窗口的事物处理完成，关闭之后，才能执行后续操作。它对代码的设计和维护提出了更高要求，这里采用 `事件` + `统一管理` 的方式进行处理。降低维护成本和提高排开发效率。

#### 模态窗口管理系统

模态系统提供了统一的事件编号，提供了统一的发送接口，提供了统一的接收处理。并且提供自定义事件的扩展，支持事件冒泡顺序处理（子组件可以拦截时间处理，可以决定是否让父组件也处理）。

发送事件方法：

- `function sendEvent(params: sendEventProps): void`

发送事件属性：

```typescript
export type sendEventProps = {
  eventType: EventType;
  eventBizType: BizEventType;
  action: ActionEventType;
  senderId: string;
  params: any;
  timestamp?: number;
};
```

接收事件处理：

- `DeviceEventEmitter.addListener('DataEvent' as DataEventType, (event) => {})`

#### 事件分类

- `AlertActionEventType`: 警告窗口事件
- `ToastActionEventType`: `toast` 窗口事件
- `SheetActionEventType`: `bottom sheet` 窗口事件
- `PromptActionEventType`: `prompt` 窗口事件
- `MenuActionEventType`: `context menu` 窗口事件
- `StateActionEventType`: `custom state` 窗口事件
- `DataActionEventType`: 数据事件（非模态窗口事件）

#### 事件使用流程示例: 删除联系人操作流程。

1. 页面发送显示确认对话框命令

```typescript
sendContactInfoEvent({
  eventType: 'AlertEvent',
  action: 'manual_remove_contact',
  params: { userId },
});
```

2. 系统收到命令显示对话框，当用户点击确认之后，发送可以执行删除操作命令

```typescript
// The modal system receives the event processing and displays a confirmation dialog.
alert.openAlert({
  title: `Block ${s.userId}`,
  message: contactInfo.deleteAlert.message,
  buttons: [
    {
      text: contactInfo.deleteAlert.cancelButton,
    },
    {
      text: contactInfo.deleteAlert.confirmButton,
      onPress: () => {
        // If the user confirms that the contact is to be deleted, an event is sent
        sendEventFromAlert({
          eventType: 'DataEvent',
          action: 'exec_remove_contact',
          params: alertEvent.params,
          eventBizType: 'contact',
        });
      },
    },
  ],
});
```

3. 页面收到命令，开始执行删除联系人操作，操作完成之后，发送显示删除操作已完成的提示。

```typescript
// The contact page receives the command to delete contacts.
removeContact(userId, (result) => {
  if (result === true) {
    // After deleting the contact, the toast prompt box is displayed.
    sendContactInfoEvent({
      eventType: 'ToastEvent',
      action: 'toast_',
      params: contactInfo.toast[1]!,
    });
    navigation.goBack();
  }
});
```

4. 系统收到显示提示命令，开始显示提示内容的窗口。

```typescript
// The modal system receives the command to display the toast prompt box.
toast.showToast(content);
```

5. 处理完成关闭，继续后续操作。

#### 示例源码

[sample code](https://github.com/easemob/react-native-chat-library/tree/dev/example/src/screens/ContactInfo.tsx)

## 典型场景：登录

目前，支持 主动登录 和 自动登录 两种方式。

#### 正常登录流程

1. 初始化: 初始化需要在应用最开始阶段处理。参考 `App.tsx` 页面的实现。
2. 初始化完成通知: 初始化完成，通过 `GlobalContainer.onInitialized` 回调通知。
3. 登录: 如果采用自动登录，可以在初始化完成之后开始。
4. 登录完成通知: 登录通过 `ChatSdkContextType.login.onResult` 通知用户, 自动登录通过 `ChatSdkContextType.autologin.onResult` 通知用户。

#### 主动登录

使用 `uikit sdk` 提供的 登录接口 `ChatSdkContextType.login`，而不是 `chat sdk` 接口 `ChatClient.login`。

登录需要用户提供必要的参数：用户 id 和 用户密码或者 token。

示例如下：

```typescript
login({
  id: 'userId',
  pass: 'userPassword',
  onResult: (result) => {
    if (result.result === true) {
      // TODO: Operations performed after successful login.
    } else {
      // TOTO: Operations after a login failure.
    }
  },
});
```

#### 自动登录

如果设置了自动登录，那么在登录成功之后，后续的登录就会自动进行。

在自动登录前加载的是 `splash` 页面，当登录成功之后，加载 `login` 或者 `home` 页面。

```typescript
autoLogin({
  onResult: ({ result, error }) => {
    if (error === undefined) {
      if (result === true) {
        // TODO:  The application home page is displayed.
      } else {
        // TODO: The login page is displayed.
      }
    } else {
      // TODO: Error handling.
    }
  },
});
```

#### 页面

登录页面没有复杂交互逻辑，仅包括 id 或者 password 输入组件，登录按钮组件等。
组件样式和写法都是通用 `react-native`, 对于刚入门的开发者请多参考，对于有经验的开发者可以忽略不计。
[sample code](https://github.com/easemob/react-native-chat-library/tree/dev/example/src/screens/SignIn.tsx)

## 典型场景：退出

退出登录主要分为两种情况：

1. 用户主动退出登录
2. 用户被动断开服务器，原因可能有很多种，具体参考官网相关文档。

#### 主动退出

```typescript
logoutAction({
  onResult: ({ result, error }) => {
    if (result === true) {
      // TODO: Operations performed after a successful exit.
    } else {
      // TODO: Exit operation after failure.
    }
  },
});
```

#### 被动退出

被动退出的原因有很多：例如：被用户其它设备踢掉、被服务器禁止登录、用户修改了密码、token 过期等。

被动退出主要通过监听事件来实现。

```typescript
DeviceEventEmitter.addListener(ConnectStateChatSdkEvent, (event) => {
  console.log('test:SplashScreen:addListener:', event);
  const eventType = event.type as ConnectStateChatSdkEventType;
  switch (eventType) {
    case 'onConnected':
      break;
    case 'onDisconnected':
      break;
    case 'onTokenDidExpire':
      break;
    case 'onTokenWillExpire':
      break;

    default:
      break;
  }
});
```

退出按钮目前在我的设置页面。
[sample code](https://github.com/easemob/react-native-chat-library/tree/dev/example/src/screens/MySetting.tsx)

## 典型应用：会话列表

该页面显示最近聊天的记录，通过聊天记录可以快速建立聊天。

会话页面 `ConversationListScreen` 由 导航器 `NavigationHeaderRight` 和 会话列表组件 `ConversationListFragment` 组成。

组件 `ConversationListFragment` 提供属性 `ConversationListFragmentProps`。

组件 `ConversationListFragment` 主要由搜索组件 `DefaultListSearchHeader` 和列表组件 `ConversationList` 组成。

搜索组件支持本地列表搜索。

列表组件显示最近聊天的会话。

#### 会话属性

会话属性目前包括了基本的事件通知。

```typescript
type ConversationListFragmentProps = {
  onLongPress?: (data?: ItemDataType) => void;
  onPress?: (data?: ItemDataType) => void;
  onData?: (data: ItemDataType[]) => void;
  onUpdateReadCount?: (unreadCount: number) => void;
};
```

#### 会话接口

页面初始化和反初始化。页面的生命周期是非常重要的概念。在生命周期内要保证页面的正确使用。

- load: 页面加载会调用该方法。
- unload: 页面卸载会调用该方法。

**<span style="color:orange">以上方法是通用的，几乎每个页面都使用了，由于不是 `class` 组件，所以，部分接口无法写在基类，后续优化。</span>**

在初始化阶段，`ConversationListFragment` 主要做了几件事情。

- `initList` 加载会话列表
- `initDirs` 创建会话目录，用来保存消息资源
- `addListeners` 初始化事件监听器，接收需要的事件。例如：消息事件、页面事件等。

在卸载阶段， `ConversationListFragment` 主要是释放资源。

- 释放事件监听器资源

会话提供的基本功能接口:

- `createConversation` 创建会话
- `removeConversation` 删除会话
- `updateConversationFromMessage` 更新会话
- `conversationRead` 会话已读

#### 会话列表项

主要对象：数据源 `ItemDataType`

```typescript
export type ItemDataType = EqualHeightListItemData & {
  convId: string;
  convType: ChatConversationType;
  lastMsg?: ChatMessage;
  convContent: string;
  timestamp: number;
  timestampS: string;
  count: number;
  actions?: {
    onDelete?: (data: ItemDataType) => void;
  };
};
```

主要对象：渲染组件 `Item`。

如果想要修改会话列表项可以参考 `ItemDataType` 和 `Item` 相关组件源码。

#### 创建会话

创建会话有几种方式:

1. 收到消息
2. 进入聊天页面，不聊天会创建临时会话，聊天创建持久会话

#### 删除会话

删除会话：目前通过列表项的侧滑显示删除菜单，点击删除。
**注意** 清理该会话的其他痕迹。例如：未读数。

#### 进入聊天页面

点击会话列表项，进入聊天页面。

#### 会话菜单

会话右上角有一个重要入口，它包括：

1. 创建群组
2. 添加联系人
3. 搜索群组

#### 扩展

用户可以根据需要进行 `对应组件` 修改和使用。

[sample code](https://github.com/easemob/react-native-chat-library/tree/dev/example/src/screens/ConversationList.tsx)

## 典型场景：聊天

目前聊天页面支持个人聊天、群组聊天、聊天内容类型支持 文本（moji 表情）、图片和语音。 详见 `ChatFragment` 和 `ChatFragmentProps`

#### 组成

聊天页面由 聊天气泡组件 和 输入组件 组成。 详见 `ChatMessageBubbleList` 和 `ChatInput`

重要组件包括：

- `ChatMessageBubbleList` 聊天气泡组件
- `ChatInput` 输入组件
- `ChatFaceList` 表情组件

#### 接口

- load 加载组件
- unload 卸载组件

**<span style="color:orange">以上方法是通用的，几乎每个页面都使用了，由于不是采用 `class` 风格组件，所以，部分接口无法写在基类，后续优化。</span>**

- initList 初始化历史消息记录
- initDirs 初始化资源目录
- clearRead 标记会话已读
- sendTextMessage 发送文本消息
- sendImageMessage 发送图片消息
- sendVoiceMessage 发送语音消息
- sendCustomMessage 发送自定义消息
- loadHistoryMessage 加载历史消息
- showFace 显示表情
- hideFace 隐藏表情
- downloadAttachment 下载附件

#### 属性

`ChatFragmentProps` 属性主要包括 会话 ID 会话类型 和 其它。

```typescript
type ChatFragmentProps = {
  screenParams: {
    params: {
      chatId: string;
      chatType: number;
    };
  };
  onUpdateReadCount?: (unreadCount: number) => void;
  onItemPress?: (data: MessageItemType) => void;
  onItemLongPress?: (data: MessageItemType) => void;
};
```

#### 聊天气泡项

目前包括：文本、语音、图片消息气泡。 目前源码封装在 `MessageBubbleList` 组件中。

##### 文本

- `TextMessageItemType`: 数据源
- `TextMessageRenderItem`: 渲染组件

##### 图片

- `ImageMessageItemType`:数据源
- `ImageMessageRenderItem`:渲染组件

##### 语音

- `VoiceMessageItemType`:数据源
- `VoiceMessageRenderItem`:渲染组件

#### 扩展

对于有更多更改需求的用户，可以参考 `ChatFragment` 设计和实现。
对于自定义消息有更改需求的用户，可以参考 `ChatMessageBubbleList` 设计和实现。
对于输入组件有更改需求的用户，可以参考 `ChatInput` 设计和实现。

#### 特别说明

为了解决代码重用和减少数据加载，添加多了个子组件。例如： `ChatContent` `ChatInput`。

[sample code](https://github.com/easemob/react-native-chat-library/tree/dev/example/src/fragments/Chat.tsx)

---

# Q & A

如果你有更多疑问请查看这里，如果你有更多建议，也请贡献到这里。

[skip to here](./QA.md)

---

# 思维导图

这个维度的说明可能增加你对该项目的了解。

[skip to here](./swdt.md)
