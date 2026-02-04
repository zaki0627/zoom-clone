import { FiMessageCircle, FiPhone, FiCopy } from "react-icons/fi";
import "./Meeting.css";
import { VideoTile } from "./VideoTile";
import { MediaControls } from "./MediaControls";
import { useNavigate, useParams } from "react-router-dom";
import { meetingRepository } from "../../modules/meetings/meeting.repository";
import { useEffect, useState } from "react";
import { PreviewMedia } from "./PreviewMedia";
import { useMeeting } from "../../modules/meetings/meeting.hook";

function Meeting() {
  const { id } = useParams();
  const [showPreview, setShowPreview] = useState(true);
  const { me, getStream, toggleVideo, toggleVoice, join, participants } =
    useMeeting(id!);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, []);
  const initialize = async () => {
    try {
      await meetingRepository.joinMeeting(id!);
      await getStream();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const joinMeeting = async () => {
    join();
    setShowPreview(false);
  };
  const leaveMeeting = async () => {
    navigate("/");
  };

  if (showPreview) {
    return (
      <PreviewMedia
        participant={me}
        onToggleVideo={toggleVideo}
        onToggleVoice={toggleVoice}
        onJoin={joinMeeting}
        onCancel={leaveMeeting}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="meeting-container">
      <div className="video-area">
        <div className="video-grid">
          <VideoTile participant={{ ...me, name: me.name + "(あなた)" }} />
          {Array.from(participants.values()).map((participant) => (
            <VideoTile key={participant.id} participant={participant} />
          ))}
        </div>
      </div>

      <div className="control-bar">
        <MediaControls
          cameraOn={me.cameraOn}
          voiceOn={me.voiceOn}
          onToggleVideo={toggleVideo}
          onToggleVoice={toggleVoice}
        />

        <button className="control-button">
          <FiMessageCircle />
        </button>

        <button className="control-button">
          <FiCopy />
        </button>

        <button className="control-button leave-button">
          <FiPhone />
        </button>
      </div>
    </div>
  );
}

export default Meeting;
