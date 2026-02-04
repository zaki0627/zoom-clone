import { VideoTile } from "./VideoTile";
import { MediaControls } from "./MediaControls";
import type { Participant } from "../../modules/meetings/meeting.hook";
interface PrevireMediaProps {
  participant: Participant;
  onToggleVideo: () => void;
  onToggleVoice: () => void;
  onJoin: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function PreviewMedia({
  participant,
  onToggleVideo,
  onToggleVoice,
  onCancel,
  onJoin,
  isLoading,
}: PrevireMediaProps) {
  if (isLoading) {
    <div className="meeting-container">
      <div className="preview-screen">
        <div className="preview-header">
          <h2>Loading...</h2>
        </div>
      </div>
    </div>;
  }
  return (
    <div className="meeting-container">
      <div className="preview-screen">
        <div className="preview-header">
          <h2>会議に参加する準備ができました</h2>
          <p>マイクとカメラの設定を確認してください</p>
        </div>

        <div className="preview-video-container">
          <VideoTile participant={participant} />
        </div>

        <MediaControls
          cameraOn={participant.cameraOn}
          voiceOn={participant.voiceOn}
          onToggleVideo={onToggleVideo}
          onToggleVoice={onToggleVoice}
        />

        <div className="preview-actions">
          <button className="control-button cancel-button" onClick={onCancel}>
            キャンセル
          </button>
          <button className="join-meeting-button" onClick={onJoin}>
            会議に参加
          </button>
        </div>
      </div>
    </div>
  );
}
