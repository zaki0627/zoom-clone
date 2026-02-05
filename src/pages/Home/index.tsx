import { Link, useNavigate } from "react-router-dom";
import { FiVideo, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import "./Home.css";
import { meetingRepository } from "../../modules/meetings/meeting.repository";
import { useState } from "react";
import { useCurrentUserStore } from "../../modules/auth/current-user.state";

function Home() {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState("");
  const { currentUser, setCurrentUser } = useCurrentUserStore();

  const startMeeting = async () => {
    try {
      const result = await meetingRepository.createMeeting();

      navigate(`/meetings/${result.meetingId}`);
    } catch (error) {
      console.log(error);
    }
  };

  const joinMeeting = async () => {
    navigate(`/meetings/${meetingId}`);
  };

  const logout = () => {
    if (window.confirm("ログアウトしますか？")) {
      localStorage.removeItem("token");
      setCurrentUser(undefined);
    }
  };
  return (
    <div className="home-container">
      <nav className="navbar">
        <div
          className="navbar-left"
          onClick={() => {
            navigate("/");
          }}
        >
          <h1 className="logo">Zoom Clone</h1>
        </div>
        <div className="navbar-right">
          <span className="username">{currentUser!.name}</span>
          <Link to="/settings" className="settings-button">
            <FiSettings /> 設定
          </Link>
          <button className="logout-button" onClick={logout}>
            <FiLogOut /> ログアウト
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="meeting-cards">
          <div className="meeting-card">
            <div className="card-icon camera-icon">
              <FiVideo />
            </div>
            <h3>新しいミーティング</h3>
            <button className="start-meeting-button" onClick={startMeeting}>
              ミーティングを開始
            </button>
          </div>

          <div className="meeting-card">
            <div className="card-icon user-icon">
              <FiUser />
            </div>
            <h3>ミーティングに参加</h3>
            <form className="join-form">
              <input
                type="text"
                placeholder="会議ID"
                className="meeting-id-input"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
              />
              <button
                type="submit"
                className="join-button"
                onClick={joinMeeting}
                disabled={!meetingId}
              >
                参加
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
