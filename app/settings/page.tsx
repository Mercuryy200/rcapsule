"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Switch,
  Avatar,
} from "@heroui/react";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [profileData, setProfileData] = useState({
    name: "",
    image: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user) {
      setProfileData({
        name: session.user.name || "",
        image: session.user.image || "",
      });
      fetchVisibility();
    }
  }, [status, router, session]);

  const fetchVisibility = async () => {
    try {
      const response = await fetch("/api/settings/visibility");

      if (response.ok) {
        const data = await response.json();

        setIsPublic(data.profilePublic);
      }
    } catch (error) {
      console.error("Error fetching visibility:", error);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const updatedData = await response.json();

        await update({
          ...session,
          user: {
            ...session?.user,
            name: updatedData.name,
            image: updatedData.image,
          },
        });

        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile");
      }
    } catch (error) {
      setMessage("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New passwords don't match");

      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");

      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setMessage("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const data = await response.json();

        setMessage(data.error || "Failed to change password");
      }
    } catch (error) {
      setMessage("Error changing password");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (value: boolean) => {
    setIsPublic(value);

    try {
      const response = await fetch("/api/settings/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePublic: value }),
      });

      if (response.ok) {
        setMessage("Profile visibility updated!");
      } else {
        setMessage("Failed to update visibility");
        setIsPublic(!value);
      }
    } catch (error) {
      setMessage("Error updating visibility");
      setIsPublic(!value);
    }
  };

  if (status === "loading") {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.includes("success")
              ? "bg-success-50 text-success"
              : "bg-danger-50 text-danger"
          }`}
        >
          {message}
        </div>
      )}

      {/* Profile Settings */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-bold">Profile Information</h2>
        </CardHeader>
        <CardBody className="gap-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar
              className="w-20 h-20"
              name={profileData.name}
              src={profileData.image || undefined}
            />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Profile Picture</p>
            </div>
          </div>

          <Input
            label="Display Name"
            placeholder="Your name"
            value={profileData.name}
            onChange={(e) =>
              setProfileData({ ...profileData, name: e.target.value })
            }
          />

          <Input
            label="Profile Image URL"
            placeholder="https://..."
            value={profileData.image}
            onChange={(e) =>
              setProfileData({ ...profileData, image: e.target.value })
            }
          />

          <Button
            color="primary"
            isLoading={loading}
            onPress={handleUpdateProfile}
          >
            Update Profile
          </Button>
        </CardBody>
      </Card>

      {/* Password Settings */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-bold">Change Password</h2>
        </CardHeader>
        <CardBody className="gap-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                currentPassword: e.target.value,
              })
            }
          />

          <Input
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                newPassword: e.target.value,
              })
            }
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value,
              })
            }
          />

          <Button
            color="primary"
            isLoading={loading}
            onPress={handleChangePassword}
          >
            Change Password
          </Button>
        </CardBody>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Privacy Settings</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Public Profile</p>
              <p className="text-sm text-gray-500">
                Allow others to view your profile and public wardrobes
              </p>
            </div>
            <Switch
              isSelected={isPublic}
              onValueChange={handleToggleVisibility}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
