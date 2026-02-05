import { Link, useNavigate } from "react-router-dom";
import "./Settings.css";
import { useState } from "react";
import { useCurrentUserStore } from "../../modules/auth/current-user.state";
import { useFlashMessage } from "../../modules/ui/ui.state";
import { accountRepository } from "../../modules/account/account.repository";

function Settings() {
  const { currentUser, setCurrentUser } = useCurrentUserStore();
  const [displayName, setDisplayName] = useState(currentUser?.name || "");
  const { addMessage } = useFlashMessage();
  const navigate = useNavigate();

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      return;
    }
    try {
      const updateUser = await accountRepository.updateProfile(
        displayName.trim(),
      );
      setCurrentUser(updateUser);
      addMessage({
        message: "プロフィールが変更されました。",
        type: "success",
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="settings-container">
      <nav className="settings-navbar">
        <div
          className="navbar-left"
          onClick={() => {
            navigate("/");
          }}
        >
          <h1 className="logo">Zoom Clone</h1>
        </div>
        <div className="navbar-right">
          <Link to="/" className="back-home-link">
            ホームに戻る
          </Link>
        </div>
      </nav>
      <main className="settings-main">
        <div className="settings-content">
          <h2 className="page-title">設定</h2>
          <div className="settings-section">
            <h3>プロフィール設定</h3>
            <form className="settings-form">
              <div className="form-group">
                <label htmlFor="displayName">表示名</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                  }}
                />
              </div>
              <button
                type="button"
                className="save-button"
                onClick={handleSaveProfile}
              >
                プロフィールを保存
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
