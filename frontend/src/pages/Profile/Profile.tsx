import { useEffect, useState, ChangeEvent } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Pencil } from "lucide-react";
import "./Profile.css";

type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  joined: string;
  degree: string;
  course: string;
  bio: string;
};

interface DecodedIdToken {
  email?: string;
  name?: string;
  [key: string]: string | undefined;
}

const decodeJWT = (token: string): DecodedIdToken | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload) as DecodedIdToken;
  } catch (err) {
    console.error("JWT Decode Error:", err);
    return null;
  }
};

const Profile = () => {
  const [visible, setVisible] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    joined: "",
    degree: "",
    course: "",
    bio: "",
  });

  useEffect(() => {
    const idToken = localStorage.getItem("id_token");
    let decodedEmail = "your@email.com";
    if (idToken) {
      const decoded = decodeJWT(idToken);
      if (decoded?.email) {
        decodedEmail = decoded.email;
        localStorage.setItem("user_email", decodedEmail);
      }
    }

    const joinedRaw = localStorage.getItem("user_created_at");
    const joinedDate = joinedRaw
      ? new Date(joinedRaw).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    const stored = localStorage.getItem("user_profile");
    if (stored) {
      setUserData({
        ...JSON.parse(stored),
        email: decodedEmail,
        joined: joinedDate,
      });
    } else {
      setUserData((prev) => ({
        ...prev,
        email: decodedEmail,
        joined: joinedDate,
      }));
    }
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem("user_profile", JSON.stringify(userData));
    setVisible(false);
  };

  const getInitials = () => {
    const { firstName, lastName, email } = userData;
    if (firstName || lastName) {
      return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
    }
    return email?.[0]?.toUpperCase() || "?";
  };

  return (
    <div className="profile-page">
      <main className="profile-content">
        <div className="profile-card">
          {/* Avatar */}
          <div className="avatar">{getInitials()}</div>

          {/* Name with edit icon */}
          <h2 className="user-name">
            {userData.firstName || "Your"} {userData.lastName || "Name"}
            <span
              style={{ marginLeft: "8px", cursor: "pointer" }}
              onClick={() => setVisible(true)}
            >
              <Pencil size={18} />
            </span>
          </h2>

          {/* Email and Join Info */}
          <p className="user-email">{userData.email}</p>
          <p className="user-joined">Member since {userData.joined}</p>

          {/* Additional Info */}
          {(userData.degree || userData.course || userData.bio) && (
            <>
              <hr style={{ margin: "1rem 0" }} />
              <div>
                <p>{userData.degree}</p>
                <p>{userData.course}</p>
                <p style={{ whiteSpace: "pre-line" }}>{userData.bio}</p>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog
        header="Edit Profile"
        visible={visible}
        style={{ width: "28rem" }}
        onHide={() => setVisible(false)}
        modal
        closable
        draggable={false}
      >
        <div className="modal-content">
          <div>
            <label htmlFor="firstName">First Name</label>
            <InputText
              id="firstName"
              name="firstName"
              value={userData.firstName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="lastName">Last Name</label>
            <InputText
              id="lastName"
              name="lastName"
              value={userData.lastName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <InputText id="email" value={userData.email} disabled />
          </div>
          <div>
            <label htmlFor="degree">Degree</label>
            <InputText
              id="degree"
              name="degree"
              value={userData.degree}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="course">Course</label>
            <InputText
              id="course"
              name="course"
              value={userData.course}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              className="p-inputtext p-component"
              rows={3}
              style={{ width: "100%", resize: "none" }}
              value={userData.bio}
              onChange={handleChange}
            />
          </div>

          <Button label="Save Changes" onClick={handleSave} />
        </div>
      </Dialog>
    </div>
  );
};

export default Profile;
