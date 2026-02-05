import { useEffect, useRef, useState } from "react";
import { useCurrentUserStore } from "../auth/current-user.state";
import { io, Socket } from "socket.io-client";
import Peer from "peerjs";
import { useNavigate } from "react-router-dom";
import { useFlashMessage } from "../ui/ui.state";

export interface ChatMessage {
  id: string;
  userName: string;
  message: string;
  createdAt: Date;
}
export interface Participant {
  id: string;
  name: string;
  stream: MediaStream | null;
  cameraOn: boolean;
  voiceOn: boolean;
  isHost?: boolean;
}
export const useMeeting = (meetingId: string) => {
  const [localStreams, setLocalStreams] = useState<MediaStream[]>([]);
  const { currentUser } = useCurrentUserStore();
  const [me, setMe] = useState<Participant>({
    id: currentUser!.id,
    name: currentUser!.name,
    stream: localStreams[0],
    cameraOn: true,
    voiceOn: true,
  });

  const socketRef = useRef<Socket>(null);
  const peerRef = useRef<Peer>(null);
  const [participants, setParticipants] = useState<Map<string, Participant>>(
    new Map(),
  );

  const navigate = useNavigate();
  const { addMessage } = useFlashMessage();
  const [chats, setChats] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setMe((prev) => ({ ...prev, stream: localStreams[0] }));
  }, [localStreams]);
  const getStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStreams((prev) => [...prev, stream]);
  };

  const toggleVideo = () => {
    let cameraOn = false;
    const localStream = me.stream;
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      cameraOn = videoTracks[0]?.enabled;
    }
    setMe((prev) => ({ ...prev, cameraOn }));

    socketRef.current?.emit("update-participant", meetingId, {
      id: me.id,
      name: me.name,
      voiceOn: me.voiceOn,
      cameraOn,
    });
  };
  const toggleVoice = () => {
    let voiceOn = false;
    const localStream = me.stream;
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      voiceOn = audioTracks[0]?.enabled;
    }
    setMe((prev) => ({ ...prev, voiceOn }));
    socketRef.current?.emit("update-participant", meetingId, {
      id: me.id,
      name: me.name,
      voiceOn,
      cameraOn: me.cameraOn,
    });
  };

  const join = async () => {
    const localStream = me.stream;
    if (!localStream || !currentUser) return;
    socketRef.current = io(import.meta.env.VITE_API_URL);
    const socket = socketRef.current;
    socket.on("connect", () => handleSocketConnected(localStream));

    socket.on("participant-joined", (data) => handeleJoined(data, localStream));
    socket.on("participant-updated", (data) => {
      setParticipants((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.participant.id, {
          ...data.participant,
          stream: prev.get(data.participant.id)?.stream,
        });
        return newMap;
      });
    });
    socket.on("participant-left", (data) => {
      setParticipants((prev) => {
        const newMap = new Map(prev);
        newMap.delete(data.leftParticipantId);
        return newMap;
      });
    });
    socket.on("close", () => {
      clear();
      addMessage({ message: "ミーティングが終了しました。", type: "success" });
      navigate("/");
    });

    socket.on("receive-chat", (chat: ChatMessage) => {
      setChats((prev) => [
        ...prev,
        {
          ...chat,
          createdAt: new Date(chat.createdAt),
        },
      ]);
    });
  };

  const handleSocketConnected = (localStream: MediaStream) => {
    const socket = socketRef.current;
    if (!socket) return;
    peerRef.current = new Peer(me.id, {
      host: "0.peerjs.com",
      port: 443,
      secure: true,
    });

    const peer = peerRef.current;
    peer.on("open", () => {
      socket.emit("join-meeting", meetingId, {
        id: me.id,
        name: me.name,
        voiceOn: me.voiceOn,
        comeraOn: me.cameraOn,
      });
    });

    peer.on("call", (mediaConn) => {
      mediaConn.answer(localStream);
    });
  };
  const handeleJoined = (data: any, localStream: MediaStream) => {
    if (!peerRef) return;
    data.participants.forEach((participant: Participant) => {
      if (participant.id !== me.id) {
        const call = peerRef.current!.call(participant.id, localStream);
        call.on("stream", (remoteStream) => {
          setParticipants((prev) => {
            const newMap = new Map(prev);
            newMap.set(participant.id, {
              ...participant,
              stream: remoteStream,
            });
            return newMap;
          });
        });
      } else {
        setMe((prev) => ({ ...prev, isHost: participant.isHost }));
      }
    });
    setChats(
      data.chats?.map((chat: ChatMessage) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
      })) || [],
    );
  };

  const clear = () => {
    socketRef.current?.emit("leave-meeting", meetingId, me.id);
    localStreams.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    setLocalStreams([]);
    setChats([]);
    peerRef.current?.destroy();
    socketRef.current?.disconnect();
  };

  const sendChatMessage = (message: string) => {
    if (socketRef.current && currentUser) {
      socketRef.current.emit("send-chat", meetingId, message, currentUser.name);
    }
  };
  return {
    me,
    getStream,
    toggleVideo,
    toggleVoice,
    join,
    participants,
    clear,
    chats,
    sendChatMessage,
  };
};
