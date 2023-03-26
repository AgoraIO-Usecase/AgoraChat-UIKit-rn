import * as React from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { RtcSurfaceView, VideoViewSetupMode } from 'react-native-agora';

import type { CallError } from '../call';
import { calllog, KeyTimeout } from '../call/CallConst';
import { createManagerImpl } from '../call/CallManagerImpl';
import { CallEndReason, CallState, CallType } from '../enums';
import { BasicCall, BasicCallProps, BasicCallState } from './BasicCall';
import { Avatar } from './components/Avatar';
import { BottomMenuButton } from './components/BottomMenuButton';
import { Elapsed } from './components/Elapsed';
import { IconButton } from './components/IconButton';
import { MiniButton } from './components/MiniButton';

const StateBarHeight = 44;
const BottomBarHeight = 60;

type BottomButtonType =
  | 'inviter-video'
  | 'inviter-audio'
  | 'inviter-timeout'
  | 'invitee-video-init'
  | 'invitee-video-loading'
  | 'invitee-video-calling'
  | 'invitee-audio-init'
  | 'invitee-audio-loading'
  | 'invitee-audio-calling';

export type SingleCallProps = BasicCallProps & {
  isMinimize?: boolean;
  elapsed: number; // ms unit
  isInviter: boolean;
  inviteeId: string;
  callState?: CallState;
  callType: 'video' | 'audio';
  bottomButtonType?: BottomButtonType;
  muteVideo?: boolean;
  onHangUp?: () => void;
  onCancel?: () => void;
  onRefuse?: () => void;
  onClose?: () => void;
  onError?: () => void;
  isTest?: boolean;
};
export type SingleCallState = BasicCallState & {
  isMinimize: boolean;
  callState: CallState;
  callType: 'video' | 'audio';
  bottomButtonType: BottomButtonType;
  muteVideo: boolean;
  peerJoinChannelSuccess: boolean;
  elapsed: number; // ms unit
  peerUid: number;
  isSwitchVideo: boolean;
};

export class SingleCall extends BasicCall<SingleCallProps, SingleCallState> {
  private _inviteeTimer?: NodeJS.Timeout;
  constructor(props: SingleCallProps) {
    super(props);
    this.state = {
      isMinimize: props.isMinimize ?? false,
      callState: props.callState ?? CallState.Connecting,
      callType: props.callType,
      bottomButtonType:
        props.bottomButtonType ??
        (props.isInviter
          ? props.callType === 'audio'
            ? 'inviter-audio'
            : 'inviter-video'
          : props.callType === 'audio'
          ? 'invitee-audio-init'
          : 'invitee-video-init'),
      muteVideo: props.muteVideo ?? false,
      channelId: '',
      callId: '',
      startPreview: false,
      joinChannelSuccess: false,
      peerJoinChannelSuccess: false,
      elapsed: props.elapsed ?? 0,
      selfUid: 0,
      peerUid: 1,
      setupMode: VideoViewSetupMode.VideoViewSetupReplace,
      isSwitchVideo: false,
    };
  }

  protected init(): void {
    if (this.props.isTest === true) {
      return;
    }
    this.manager = createManagerImpl();
    // this.manager?.init({
    //   option: {
    //     agoraAppId: this.props.appKey,
    //     callTimeout: this.props.timeout ?? 30000,
    //     ringFilePath: '', // TODO:
    //   } as CallOption,
    //   enableLog: true,
    //   requestRTCToken: this.props.requestRTCToken,
    //   requestUserMap: this.props.requestUserMap,
    //   listener: this,
    //   onResult: () => {
    //     console.log('test:init:onResult:');
    //     if (this.props.isInviter === true) {
    //       if (this.state.callState === CallState.Connecting) {
    //         this.startCall();
    //       }
    //     }
    //   },
    // });
    // this.manager?.clear();
    this.manager?.setCurrentUser({
      userId: this.props.currentId,
      userNickName: this.props.currentName,
      userAvatarUrl: this.props.currentUrl,
    });

    this.manager?.initRTC();

    if (this.props.callType === 'audio') {
      this.manager?.enableAudio();
    } else {
      this.manager?.enableVideo();
      this.manager?.startPreview();
      this.setState({ startPreview: true });
    }

    this.manager?.addViewListener(this);
    if (this.props.isInviter === true) {
      if (this.state.callState === CallState.Connecting) {
        this.startCall();
      }
    } else {
      this._inviteeTimer = setTimeout(() => {
        this.onClickClose();
      }, this.props.timeout ?? KeyTimeout);
    }
  }
  protected unInit(): void {
    if (this.props.isTest === true) {
      return;
    }
    if (this.props.callType === 'audio') {
      this.manager?.disableAudio();
    } else {
      this.manager?.disableVideo();
      this.manager?.stopPreview();
      this.setState({ startPreview: false });
    }
    this.manager?.removeViewListener(this);
    this.manager?.clear();

    this.manager?.unInitRTC();
    // this.manager?.unInit();
  }

  private startCall() {
    if (this.manager) {
      const channelId = this.manager.createChannelId();
      this.setState({ channelId });
      switch (this.props.callType) {
        case 'audio':
          this.manager.startSingleAudioCall({
            inviteeId: this.props.inviteeId,
            channelId: channelId,
            onResult: (params) => {
              calllog.log('SingleCall:startSingleAudioCall:', params);
              if (params.error) {
                throw params.error;
              }
              if (params.callId) {
                this.setState({ callId: params.callId });
              }
            },
          });
          break;
        case 'video':
          this.manager.startSingleVideoCall({
            inviteeId: this.props.inviteeId,
            channelId: channelId,
            onResult: (params) => {
              calllog.log('SingleCall:startSingleVideoCall:', params);
              if (params.error) {
                throw params.error;
              }
              if (params.callId) {
                this.setState({ callId: params.callId });
              }
            },
          });
          break;
        default:
          break;
      }
    }
  }

  private updateBottomButtons(): void {
    const { peerJoinChannelSuccess, joinChannelSuccess } = this.state;
    if (peerJoinChannelSuccess && joinChannelSuccess) {
      if (this.props.isInviter === false) {
        let s;
        if (this.props.callType === 'audio') {
          s = 'invitee-audio-calling' as BottomButtonType;
        } else {
          s = 'invitee-video-calling' as BottomButtonType;
        }
        this.setState({ bottomButtonType: s });
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  //// OnButton ////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  onClickHangUp = () => {
    const { isInviter, onHangUp, onCancel, onRefuse } = this.props;
    const { callState, callId } = this.state;
    this.manager?.hangUpCall({
      callId: callId,
      onResult: (params) => {
        calllog.log('SingleCall:onClickHangUp:', params);
      },
    });
    if (isInviter === true) {
      if (callState === CallState.Calling) {
        this.manager?.hangUpCall({
          callId: callId,
          onResult: (params: {
            callId?: string | undefined;
            error?: CallError | undefined;
          }) => {
            calllog.log('SingleCall:onClickHangUp:hangUpCall:', params);
          },
        });
        onHangUp?.();
      } else {
        this.manager?.cancelCall({
          callId: callId,
          onResult: (params: {
            callId?: string | undefined;
            error?: CallError | undefined;
          }) => {
            calllog.log('SingleCall:onClickHangUp:cancelCall:', params);
          },
        });
        onCancel?.();
      }
    } else {
      clearTimeout(this._inviteeTimer);
      this._inviteeTimer = undefined;
      if (callState === CallState.Calling) {
        this.manager?.hangUpCall({
          callId: callId,
          onResult: (params: {
            callId?: string | undefined;
            error?: CallError | undefined;
          }) => {
            calllog.log('SingleCall:onClickHangUp:hangUpCall:', params);
          },
        });
        onHangUp?.();
      } else {
        this.manager?.refuseCall({
          callId: callId,
          onResult: (params: {
            callId?: string | undefined;
            error?: CallError | undefined;
          }) => {
            calllog.log('SingleCall:onClickHangUp:refuseCall:', params);
          },
        });
        onRefuse?.();
      }
    }
  };
  onClickSpeaker = () => {};
  onClickMicrophone = () => {};
  onClickVideo = () => {};
  onClickRecall = () => {};
  onClickClose = () => {
    this.setState({ callState: CallState.Idle });
    const { onClose } = this.props;
    onClose?.();
  };
  onClickAccept = () => {
    clearTimeout(this._inviteeTimer);
    this._inviteeTimer = undefined;
    if (this.props.callType === 'audio') {
      this.setState({ bottomButtonType: 'invitee-audio-loading' });
    } else {
      this.setState({ bottomButtonType: 'invitee-video-loading' });
    }
    const callId = this.manager?.getCurrentCallId();
    if (callId) {
      this.setState({ callId });
      this.manager?.acceptCall({
        callId: callId,
        onResult: (params: {
          callId?: string | undefined;
          error?: CallError | undefined;
        }) => {
          calllog.log('SingleCall:onClickAccept:acceptCall:', params);
        },
      });
    }
  };
  onSwitchVideo = () => {
    calllog.log(
      'SingleCall:onClickAccept:onSwitchVideo:',
      this.state.isSwitchVideo
    );
    this.setState({ isSwitchVideo: !this.state.isSwitchVideo });
  };

  //////////////////////////////////////////////////////////////////////////////
  //// CallViewListener ////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  onCallEnded(params: {
    channelId: string;
    callType: CallType;
    endReason: CallEndReason;
    elapsed: number;
  }): void {
    calllog.log('SingleCall:onCallEnded:', params);
    this.onClickClose();
  }

  onCallOccurError(params: { channelId: string; error: CallError }): void {
    calllog.log('SingleCall:onCallOccurError:', params);
    this.onClickClose();
  }

  onRequestJoin(params: {
    channelId: string;
    userId: string;
    userChannelId: number;
    userRTCToken: string;
  }): void {
    calllog.log('SingleCall:onRequestJoin:', params);
    this.manager?.joinChannel(params);
  }

  onRemoteUserJoined(params: {
    channelId: string;
    userChannelId: number;
    userId: string;
  }): void {
    calllog.log('SingleCall:onRemoteUserJoined:', params);
    this.setState({
      peerJoinChannelSuccess: true,
      peerUid: params.userChannelId,
    });
    this.updateBottomButtons();
  }

  onSelfJoined(params: {
    channelId: string;
    userChannelId: number;
    userId: string;
    elapsed: number;
  }): void {
    calllog.log('SingleCall:onSelfJoined:', params);
    this.setState({
      joinChannelSuccess: true,
      elapsed: params.elapsed,
      selfUid: params.userChannelId,
    });
    this.setState({ callState: CallState.Calling });
    this.updateBottomButtons();
  }

  onRemoteUserOffline(params: {
    channelId: string;
    userChannelId: number;
    userId: string;
  }): void {
    calllog.log('SingleCall:onRemoteUserOffline:', params);
    this.setState({ peerJoinChannelSuccess: false });
  }

  onSelfLeave(params: {
    channelId: string;
    userChannelId: number;
    userId: string;
  }): void {
    calllog.log('SingleCall:onSelfLeave:', params);
    this.setState({ joinChannelSuccess: false });
  }

  //////////////////////////////////////////////////////////////////////////////
  //// Render //////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  protected renderSelfVideo(): React.ReactNode {
    const { isMinimize, selfUid, setupMode, startPreview, joinChannelSuccess } =
      this.state;
    calllog.log('SingleCall:renderSelfVideo:', selfUid);
    if (isMinimize === true) {
      return null;
    }
    if (this.props.callType === 'audio') {
      return null;
    }
    if (startPreview !== true && joinChannelSuccess !== true) {
      return null;
    }
    return (
      <RtcSurfaceView
        style={{ flex: 1 }}
        canvas={{
          uid: selfUid,
          setupMode,
        }}
      />
    );
  }

  protected renderPeerVideo(): React.ReactNode {
    const { peerUid, setupMode, peerJoinChannelSuccess } = this.state;
    calllog.log('SingleCall:renderPeerVideo:', peerUid);
    if (this.props.callType === 'audio') {
      return null;
    }
    if (peerJoinChannelSuccess !== true) {
      return null;
    }
    return (
      <RtcSurfaceView
        style={{ flex: 1 }}
        canvas={{
          uid: peerUid,
          setupMode,
        }}
      />
    );
  }

  protected renderMiniVideo(): React.ReactNode {
    calllog.log('SingleCall:renderMiniVideo:');
    if (this.props.callType === 'audio') {
      return null;
    }
    const { isSwitchVideo, isMinimize, callState } = this.state;
    let ret = null;
    // const getUid = () => {
    //   if (callState === CallState.Calling) {
    //     // TODO: 已连接渲染大屏别人
    //   } else {
    //     // TODO: 未连接渲染大屏自己
    //   }
    //   if (isMinimize === true) {
    //     // TODO: 只渲染对方
    //   } else {
    //     // TODO:都渲染
    //   }
    //   if (isSwitchVideo === true) {
    //     // TODO:调换双方屏幕
    //   } else {
    //     // TODO:再次调换双方屏幕
    //   }
    //   return 0;
    // };
    if (callState === CallState.Calling) {
      // TODO: 已连接大屏渲染别人
      if (isMinimize === true) {
        // TODO: 只渲染对方
        if (isSwitchVideo === true) {
          // TODO:调换双方屏幕
          ret = this.renderPeerVideo();
        } else {
          // TODO:再次调换双方屏幕
        }
      } else {
        // TODO:都渲染
        if (isSwitchVideo === true) {
          // TODO:调换双方屏幕
          calllog.log('test:renderMiniVideo:', true);
          ret = this.renderPeerVideo();
        } else {
          // TODO:再次调换双方屏幕
          calllog.log('test:renderMiniVideo:', false);
          ret = this.renderSelfVideo();
        }
      }
    } else {
      // TODO: 未连接大屏渲染自己
      if (isMinimize === true) {
        // TODO: 只渲染对方
        if (isSwitchVideo === true) {
          // TODO:调换双方屏幕
        } else {
          // TODO:再次调换双方屏幕
          ret = this.renderPeerVideo();
        }
      } else {
        // TODO:都渲染
        if (isSwitchVideo === true) {
          // TODO:调换双方屏幕
          calllog.log('test:renderMiniVideo:2', true);
          ret = this.renderSelfVideo();
        } else {
          // TODO:再次调换双方屏幕
          calllog.log('test:renderMiniVideo:2', false);
          ret = this.renderPeerVideo();
        }
      }
    }
    calllog.log('test:renderMiniVideo:ret:', ret === null);
    return ret;
  }

  protected renderFullVideo(): React.ReactNode {
    calllog.log('SingleCall:renderFullVideo:');
    if (this.props.callType === 'audio') {
      return null;
    }
    const { isSwitchVideo, isMinimize, callState } = this.state;
    let renderType = 0 as 0 | 1 | 2; // 0: no, 1: self, 2: peer
    let ret = null;
    // const getUid = () => {
    //   if (callState === CallState.Calling) {
    //     // TODO: 已连接渲染大屏别人
    //   } else {
    //     // TODO: 未连接渲染大屏自己
    //   }
    //   if (isMinimize === true) {
    //     // TODO: 只渲染对方
    //   } else {
    //     // TODO:都渲染
    //   }
    //   if (isSwitchVideo === true) {
    //     // TODO:调换双方屏幕
    //   } else {
    //     // TODO:再次调换双方屏幕
    //   }
    //   return 0;
    // };
    if (callState === CallState.Calling) {
      // TODO: 已连接大屏渲染别人
      if (isMinimize === true) {
        // TODO: 只渲染对方
      } else {
        // TODO:都渲染
        if (isSwitchVideo === true) {
          // TODO:调换双方屏幕
          ret = this.renderSelfVideo();
          renderType = 1;
        } else {
          // TODO:再次调换双方屏幕
          ret = this.renderPeerVideo();
          renderType = 2;
        }
      }
    } else {
      // TODO: 未连接大屏渲染自己
      if (isMinimize === true) {
        // TODO: 只渲染对方
      } else {
        // TODO:都渲染
        if (isSwitchVideo === true) {
          // TODO:调换双方屏幕
          ret = this.renderPeerVideo();
          renderType = 2;
        } else {
          // TODO:再次调换双方屏幕
          ret = this.renderSelfVideo();
          renderType = 1;
        }
      }
    }
    calllog.log('SingleCall:renderSelfVideo:ret:', renderType, ret);
    // if (renderType === 0) {
    //   return null;
    // } else if (renderType === 1) {
    //   const {
    //     isMinimize,
    //     selfUid,
    //     setupMode,
    //     startPreview,
    //     joinChannelSuccess,
    //   } = this.state;
    //   calllog.log('SingleCall:renderSelfVideo:', selfUid);
    //   if (isMinimize === true) {
    //     return null;
    //   }
    //   if (startPreview !== true && joinChannelSuccess !== true) {
    //     return null;
    //   }
    //   return (
    //     <RtcSurfaceView
    //       style={{ flex: 1 }}
    //       canvas={{
    //         uid: selfUid,
    //         setupMode,
    //       }}
    //     />
    //   );
    // } else if (renderType === 2) {
    //   const { peerUid, setupMode, peerJoinChannelSuccess } = this.state;
    //   calllog.log('SingleCall:renderPeerVideo:', peerUid);
    //   if (peerJoinChannelSuccess !== true) {
    //     return null;
    //   }
    //   return (
    //     <RtcSurfaceView
    //       style={{ flex: 1 }}
    //       canvas={{
    //         uid: peerUid,
    //         setupMode,
    //       }}
    //     />
    //   );
    // }
    // return (
    //   <RtcSurfaceView
    //     style={{ flex: 1 }}
    //     canvas={{
    //       uid: isSwitchVideo ? selfUid : peerUid,
    //       setupMode,
    //     }}
    //   />
    // );
    return ret;
  }

  protected renderSafeArea(): React.ReactNode {
    return (
      <View
        style={{
          height: StateBarHeight,
          // backgroundColor: 'green',
        }}
      />
    );
  }
  protected renderTopBar(): React.ReactNode {
    return (
      <View
        style={{
          flexDirection: 'row',
          position: 'absolute',
          top: StateBarHeight,
          // backgroundColor: 'red',
        }}
      >
        <View
          style={{
            marginLeft: 15,
          }}
        >
          <MiniButton
            iconName="chevron_left"
            color="white"
            backgroundColor="rgba(0, 0, 0, 0.0)"
            size={28}
            onPress={() => {
              this.setState({ isMinimize: true });
            }}
          />
        </View>
        <View style={{ flexGrow: 1 }} />
        <View
          style={{
            marginRight: 15,
          }}
        >
          <IconButton
            iconName="camera_spin"
            color="white"
            backgroundColor="rgba(255, 255, 255, 0.2)"
            size={28}
            containerSize={40}
            onPress={() => {
              calllog.log('test:22343');
            }}
          />
        </View>
      </View>
    );
  }
  protected renderAvatar(): React.ReactNode {
    const { elapsed } = this.props;
    const { callType, callState } = this.state;
    return (
      <View
        style={{
          alignItems: 'center',
          // backgroundColor: 'red',
        }}
      >
        <View style={{ height: 60 }} />
        <Avatar uri="" size={100} radius={100} />
        <View style={{ marginVertical: 10 }}>
          <Text
            style={{
              fontSize: 24,
              lineHeight: 28.64,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            Monika
          </Text>
        </View>
        {callState === CallState.Calling ? (
          <Elapsed timer={elapsed} />
        ) : (
          <Text
            style={{
              fontSize: 16,
              lineHeight: 22,
              fontWeight: '400',
              textAlign: 'center',
            }}
          >
            {callType === 'audio' ? 'Audio Call' : 'Video Call'}
          </Text>
        )}
      </View>
    );
  }

  protected renderBottomMenu(): React.ReactNode {
    const { bottomButtonType } = this.state;
    calllog.log('test:renderBottomMenu', bottomButtonType);
    const disabled = true;
    let ret = <></>;
    const Container = (props: React.PropsWithChildren<{}>) => {
      const { children } = props;
      return (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            position: 'absolute',
            bottom: BottomBarHeight,
            width: '100%',
          }}
        >
          {children}
        </View>
      );
    };
    switch (bottomButtonType) {
      case 'inviter-audio':
        ret = (
          <Container>
            <BottomMenuButton name="speaker" onPress={this.onClickSpeaker} />
            <BottomMenuButton
              name="microphone"
              onPress={this.onClickMicrophone}
            />
            <BottomMenuButton name="hangup" onPress={this.onClickHangUp} />
          </Container>
        );
        break;
      case 'inviter-video':
        ret = (
          <Container>
            <BottomMenuButton name="video" onPress={this.onClickVideo} />
            <BottomMenuButton
              name="microphone"
              onPress={this.onClickMicrophone}
            />
            <BottomMenuButton name="hangup" onPress={this.onClickHangUp} />
          </Container>
        );
        break;
      case 'inviter-timeout':
        ret = (
          <Container>
            <BottomMenuButton name="recall" onPress={this.onClickRecall} />
            <BottomMenuButton name="close" onPress={this.onClickClose} />
          </Container>
        );
        break;
      case 'invitee-video-init':
        ret = (
          <Container>
            <BottomMenuButton name="video" onPress={this.onClickVideo} />
            <BottomMenuButton name="hangup" onPress={this.onClickHangUp} />
            <BottomMenuButton name="accept" onPress={this.onClickAccept} />
          </Container>
        );
        break;
      case 'invitee-video-loading':
        ret = (
          <Container>
            <BottomMenuButton name="video" onPress={this.onClickVideo} />
            <BottomMenuButton name="hangup" onPress={this.onClickHangUp} />
            <BottomMenuButton name="accepting" disabled={disabled} />
          </Container>
        );
        break;
      case 'invitee-video-calling':
        ret = (
          <Container>
            <BottomMenuButton name="video" onPress={this.onClickVideo} />
            <BottomMenuButton
              name="microphone"
              onPress={this.onClickMicrophone}
            />
            <BottomMenuButton name="hangup" onPress={this.onClickHangUp} />
          </Container>
        );
        break;
      case 'invitee-audio-init':
        ret = (
          <Container>
            <BottomMenuButton name="hangup" onPress={this.onClickHangUp} />
            <BottomMenuButton name="accept" onPress={this.onClickAccept} />
          </Container>
        );
        break;
      case 'invitee-audio-loading':
        ret = (
          <Container>
            <BottomMenuButton name="hangup" onPress={this.onClickHangUp} />
            <BottomMenuButton name="accepting" disabled={disabled} />
          </Container>
        );
        break;
      case 'invitee-audio-calling':
        ret = (
          <Container>
            <BottomMenuButton
              name="microphone"
              onPress={this.onClickMicrophone}
            />
            <BottomMenuButton name="hangup" onPress={this.onClickHangUp} />
          </Container>
        );
        break;

      default:
        break;
    }
    return ret;
  }
  protected renderFloatAudio(): React.ReactNode {
    const { elapsed } = this.props;
    const { callState } = this.state;
    const content = 'Calling...';
    return (
      <Pressable
        style={{
          width: 76,
          height: 76,
          position: 'absolute',
          backgroundColor: 'grey',
          right: 10,
          top: 54,
          borderRadius: 12,
        }}
        onPress={() => {
          this.setState({ isMinimize: false });
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Avatar uri="" size={36} />
          {callState === CallState.Calling ? (
            <Elapsed timer={elapsed} />
          ) : (
            <Text
              style={{
                fontSize: 14,
                lineHeight: 18,
                fontWeight: '400',
                textAlign: 'center',
              }}
            >
              {content}
            </Text>
          )}
        </View>
      </Pressable>
    );
  }
  protected renderFloatVideo(): React.ReactNode {
    const { elapsed } = this.props;
    const { callState, isMinimize, muteVideo } = this.state;
    const content = 'Calling...';
    if (isMinimize === true) {
      return (
        <Pressable
          onPress={() => {
            this.setState({ isMinimize: false });
          }}
          style={{
            width: callState === CallState.Calling ? 90 : 76,
            height: callState === CallState.Calling ? 160 : 76,
            position: 'absolute',
            backgroundColor: 'grey',
            right: 10,
            top: 54,
            borderRadius: 12,
          }}
        >
          {callState === CallState.Calling ? (
            <View
              style={{
                flex: 1,
                marginBottom: 10,
                alignSelf: 'center',
                // backgroundColor: 'green',
                position: 'absolute',
                bottom: 7,
              }}
            >
              <Elapsed timer={elapsed} />
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Avatar uri="" size={36} />
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 18,
                  fontWeight: '400',
                  textAlign: 'center',
                }}
              >
                {content}
              </Text>
            </View>
          )}
        </Pressable>
      );
    } else {
      calllog.log('test:renderFloatVideo:234');
      return (
        <Pressable
          onPress={this.onSwitchVideo}
          style={{
            width: muteVideo === false ? 90 : 76,
            height: muteVideo === false ? 160 : 76,
            position: 'absolute',
            backgroundColor: 'grey',
            right: 10,
            top: 10,
            borderRadius: 12,
          }}
        >
          {this.renderSelfVideo()}
          {/* {isSwitchVideo ? this.renderSelfVideo() : this.renderPeerVideo()} */}
          {/* {this.renderMiniVideo()} */}
          {muteVideo === false ? null : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#909090',
                borderRadius: 12,
              }}
            >
              <Avatar uri="" size={36} />
              <View
                style={{
                  position: 'absolute',
                  bottom: 7,
                  right: 7,
                  // backgroundColor: 'red',
                  width: 16,
                  height: 16,
                }}
              >
                <MiniButton
                  iconName="video_slash"
                  size={16}
                  color="white"
                  backgroundColor="rgba(0,0,0,0.0)"
                />
              </View>
            </View>
          )}
        </Pressable>
      );
    }
  }
  protected renderContent(): React.ReactNode {
    const { callType, callState } = this.state;
    let content = null;
    if (callState === CallState.Calling) {
      if (callType === 'audio') {
        content = this.renderAvatar();
      } else {
        content = this.renderFloatVideo();
      }
    } else {
      if (callType === 'audio') {
        content = this.renderAvatar();
      } else {
        content = this.renderFloatVideo();
      }
    }
    return (
      <View
        style={{
          // flex: 1,
          alignItems: 'center',
          position: 'absolute',
          width: '100%',
          top: 100,
        }}
      >
        {content}
      </View>
    );
  }
  protected renderBody(): React.ReactNode {
    const { width: screenWidth, height: screenHeight } =
      Dimensions.get('screen');
    // const { isMinimize, callType, isSwitchVideo } = this.state;
    const { isMinimize, callType } = this.state;
    if (isMinimize) {
      if (callType === 'audio') {
        return this.renderFloatAudio();
      } else {
        return this.renderFloatVideo();
      }
    }
    return (
      <View
        style={{
          position: 'absolute',
          width: screenWidth,
          height: screenHeight,
          backgroundColor: 'rgba(0,0,0,0.4)',
        }}
      >
        {this.renderPeerVideo()}
        {/* {peerJoinChannelSuccess && joinChannelSuccess ? (
          <RtcSurfaceView
            style={{ flex: 1 }}
            canvas={{
              uid: isSwitchVideo ? peerUid : selfUid,
              setupMode,
            }}
          />
        ) : null} */}
        {/* {isSwitchVideo ? (
          peerJoinChannelSuccess ? (
            <RtcSurfaceView
              style={{ flex: 1 }}
              canvas={{
                uid: isSwitchVideo ? peerUid : selfUid,
                setupMode,
              }}
            />
          ) : null
        ) : startPreview || joinChannelSuccess ? (
          <RtcSurfaceView
            style={{ flex: 1 }}
            canvas={{
              uid: isSwitchVideo ? selfUid : peerUid,
              setupMode,
            }}
          />
        ) : null} */}
        {/* {this.renderFullVideo()} */}
        {/* <View style={{ flex: 1, backgroundColor: 'blue' }} /> */}
        {/* {this.renderSafeArea()} */}
        {this.renderTopBar()}
        {this.renderContent()}
        {this.renderBottomMenu()}
        {/* {this.renderSafeArea()} */}
      </View>
    );
  }
}
