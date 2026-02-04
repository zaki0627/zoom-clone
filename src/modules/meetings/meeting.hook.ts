import { useEffect, useState } from "react";
import { useCurrentUserStore } from "../auth/current-user.state";
export interface Participant {
  id: string;
  name: string;
  stream: MediaStream | null;
  cameraOn: boolean;
  voiceOn: boolean;
}
export const useMeeting = () => {
  const [localStreams, setLocalStreams] = useState<MediaStream[]>([]);
  const { currentUser } = useCurrentUserStore();
  const [me, setMe] = useState<Participant>({
    id: currentUser!.id,
    name: currentUser!.name,
    stream: localStreams[0],
    cameraOn: true,
    voiceOn: true,
  });
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
  };
  return { me, getStream, toggleVideo, toggleVoice };
};
