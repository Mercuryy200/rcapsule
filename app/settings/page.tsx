"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Input, Switch, Avatar, Divider } from "@heroui/react";
import {
  UserCircleIcon,
  ShieldCheckIcon,
  EyeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "@/contexts/UserContext";
import { ImageUpload } from "@/components/closet/ImageUpload"; // Reusing your existing component

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { user, refreshUser } = useUser();
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("profile");

  // Forms
  const [profileData, setProfileData] = useState({ name: "", image: "" });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPublic, setIsPublic] = useState(false);

  // Init Data
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated" && user) {
      setProfileData({ name: user.name || "", image: user.image || "" });
      fetchVisibility();
    }
  }, [status, router, user]);

  const fetchVisibility = async () => {
    try {
      const res = await fetch("/api/settings/visibility");
      if (res.ok) {
        const data = await res.json();
        setIsPublic(data.profilePublic);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- HANDLERS ---

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        await refreshUser(); // Update context
        setMessage({ text: "Profile updated successfully.", type: "success" });
      } else {
        setMessage({ text: "Failed to update profile.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters.",
        type: "error",
      });
      return;
    }

    setLoading(true);
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
        setMessage({ text: "Password changed successfully.", type: "success" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const data = await response.json();
        setMessage({
          text: data.error || "Failed to change password.",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "An error occurred.", type: "error" });
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
      if (!response.ok) setIsPublic(!value); // Revert on fail
    } catch (error) {
      setIsPublic(!value);
    }
  };

  if (status === "loading") return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-12">
        <Button
          isIconOnly
          variant="light"
          radius="full"
          onPress={() => router.back()}
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            Settings
          </h1>
          <p className="text-xs uppercase tracking-widest text-default-500">
            Manage account & privacy
          </p>
        </div>
      </div>

      {/* MESSAGE BANNER */}
      {message.text && (
        <div
          className={`mb-8 p-4 border-l-4 text-sm ${message.type === "success" ? "border-success bg-success-50 text-success-700" : "border-danger bg-danger-50 text-danger-700"}`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* SIDEBAR TABS */}
        <div className="lg:col-span-3">
          <div className="flex flex-col gap-2 sticky top-24">
            <button
              onClick={() => setActiveTab("profile")}
              className={`text-left px-4 py-3 text-xs uppercase tracking-widest font-bold transition-all border-l-2 ${activeTab === "profile" ? "border-primary text-primary bg-primary/5" : "border-transparent text-default-400 hover:text-foreground"}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`text-left px-4 py-3 text-xs uppercase tracking-widest font-bold transition-all border-l-2 ${activeTab === "security" ? "border-primary text-primary bg-primary/5" : "border-transparent text-default-400 hover:text-foreground"}`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`text-left px-4 py-3 text-xs uppercase tracking-widest font-bold transition-all border-l-2 ${activeTab === "privacy" ? "border-primary text-primary bg-primary/5" : "border-transparent text-default-400 hover:text-foreground"}`}
            >
              Privacy
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="lg:col-span-9 space-y-12">
          {/* PROFILE SECTION */}
          {activeTab === "profile" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                  <UserCircleIcon className="w-6 h-6" /> Public Profile
                </h2>
                <Divider className="my-4" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <Avatar
                      src={profileData.image || undefined}
                      className="w-32 h-32 text-large"
                      name={profileData.name}
                      isBordered
                    />
                  </div>

                  <div className="w-full max-w-[200px]">
                    <ImageUpload
                      value={profileData.image}
                      onChange={(url) =>
                        setProfileData({ ...profileData, image: url })
                      }
                      folder="profile" // Saves to: user_id/profile/filename
                      label="Change Photo"
                    />
                  </div>
                  <p className="text-[10px] text-default-400 uppercase tracking-widest text-center">
                    Max 5MB • JPG, PNG
                  </p>
                </div>

                {/* Text Fields */}
                <div className="md:col-span-2 space-y-6">
                  <Input
                    label="Display Name"
                    variant="bordered"
                    radius="none"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    classNames={{ inputWrapper: "h-12" }}
                  />
                  <Input
                    label="Email"
                    variant="bordered"
                    radius="none"
                    value={session?.user?.email || ""}
                    isReadOnly
                    className="opacity-60"
                  />

                  <div className="pt-4 flex justify-end">
                    <Button
                      color="primary"
                      radius="none"
                      className="uppercase font-bold tracking-widest px-8 shadow-lg shadow-primary/20"
                      isLoading={loading}
                      onPress={handleUpdateProfile}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY SECTION */}
          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheckIcon className="w-6 h-6" /> Password & Auth
                </h2>
                <Divider className="my-4" />
              </div>

              <div className="max-w-md space-y-6">
                <Input
                  type="password"
                  label="Current Password"
                  variant="bordered"
                  radius="none"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                />
                <Input
                  type="password"
                  label="New Password"
                  variant="bordered"
                  radius="none"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                />
                <Input
                  type="password"
                  label="Confirm New Password"
                  variant="bordered"
                  radius="none"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                />

                <div className="pt-4">
                  <Button
                    color="primary"
                    radius="none"
                    className="uppercase font-bold tracking-widest"
                    isLoading={loading}
                    onPress={handleChangePassword}
                  >
                    Update Password
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY SECTION */}
          {activeTab === "privacy" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                  <EyeIcon className="w-6 h-6" /> Privacy Control
                </h2>
                <Divider className="my-4" />
              </div>

              <div className="border border-default-200 p-6 flex items-center justify-between bg-content1">
                <div>
                  <p className="font-bold text-lg mb-1">Public Profile</p>
                  <p className="text-sm text-default-500 max-w-sm">
                    When enabled, anyone can view your profile and public
                    collections. Disable to make your account private.
                  </p>
                </div>
                <Switch
                  isSelected={isPublic}
                  onValueChange={handleToggleVisibility}
                  color="success"
                  classNames={{
                    wrapper: "group-data-[selected=true]:bg-foreground",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
