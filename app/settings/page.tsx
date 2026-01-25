"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Switch,
  Avatar,
  Divider,
  Select,
  SelectItem,
  RadioGroup,
  Radio,
  Chip,
} from "@heroui/react";
import {
  UserCircleIcon,
  ShieldCheckIcon,
  EyeIcon,
  ArrowLeftIcon,
  AdjustmentsHorizontalIcon,
  CreditCardIcon,
  SparklesIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "@/contexts/UserContext";
import { ImageUpload } from "@/components/closet/ImageUpload";

const STYLE_OPTIONS = [
  { label: "Minimalist", value: "minimalist" },
  { label: "Streetwear", value: "streetwear" },
  { label: "Vintage", value: "vintage" },
  { label: "Business", value: "business" },
  { label: "Casual", value: "casual" },
  { label: "Athleisure", value: "athleisure" },
  { label: "Bohemian", value: "bohemian" },
];

const SUSTAINABILITY_OPTIONS = [
  { label: "Eco-friendly Materials", key: "eco_materials" },
  { label: "Second-hand / Thrifting", key: "second_hand" },
  { label: "Fair Trade", key: "fair_trade" },
  { label: "Local Production", key: "local" },
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { user, refreshUser, isPremium } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("profile");

  const [profileData, setProfileData] = useState({ name: "", image: "" });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPublic, setIsPublic] = useState(false);

  const [prefLoading, setPrefLoading] = useState(false);
  const [prefData, setPrefData] = useState({
    budgetGoal: 0,
    temperature_unit: "celsius",
    location_city: "",
    location_country: "",
    styleGoals: new Set<string>([]),
    sustainabilityGoals: {} as Record<string, boolean>,
    notifications: {
      email: true,
      push: false,
      marketing: false,
    } as Record<string, boolean>,
    analyticsPrivacy: "private",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated" && user) {
      setProfileData({ name: user.name || "", image: user.image || "" });
      fetchVisibility();
    }
  }, [status, router, user]);

  useEffect(() => {
    if (activeTab === "preferences" && status === "authenticated") {
      fetchPreferences();
    }
  }, [activeTab, status]);

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

  const fetchPreferences = async () => {
    setPrefLoading(true);
    try {
      const res = await fetch("/api/user/preference");
      if (res.ok) {
        const data = await res.json();

        setPrefData({
          ...data,
          budgetGoal: data.budgetGoal || 0,
          location_city: data.location_city || "",
          location_country: data.location_country || "",
          styleGoals: new Set(data.styleGoals || []),
          sustainabilityGoals: data.sustainabilityGoals || {},
          notifications: data.notifications || {
            email: true,
            push: false,
            marketing: false,
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch preferences", error);
    } finally {
      setPrefLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ text: "Failed to open billing portal.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred.", type: "error" });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const payload = {
        ...prefData,
        styleGoals: Array.from(prefData.styleGoals),
      };

      const response = await fetch("/api/user/preference", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage({
          text: "Preferences saved successfully.",
          type: "success",
        });
      } else {
        setMessage({ text: "Failed to save preferences.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

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
        await refreshUser();
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
      if (!response.ok) setIsPublic(!value);
    } catch (error) {
      setIsPublic(!value);
    }
  };

  const updateJsonField = (
    field: "sustainabilityGoals" | "notifications",
    key: string,
    value: boolean,
  ) => {
    setPrefData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: value,
      },
    }));
  };

  // Format subscription end date
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic mb-2">
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
            {[
              "profile",
              "subscription",
              "security",
              "privacy",
              "preferences",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-4 py-3 text-xs uppercase tracking-widest font-bold transition-all border-l-2 ${activeTab === tab ? "border-primary text-primary bg-primary/5" : "border-transparent text-default-400 hover:text-foreground"}`}
              >
                {tab}
              </button>
            ))}
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
                      folder="profile"
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

          {/* SUBSCRIPTION SECTION */}
          {activeTab === "subscription" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                  <CreditCardIcon className="w-6 h-6" /> Subscription
                </h2>
                <Divider className="my-4" />
              </div>

              {isPremium ? (
                // Premium User View
                <div className="space-y-6">
                  {/* Status Card */}
                  <div className="border border-foreground bg-foreground text-background p-8">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <SparklesIcon className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                            Current Plan
                          </span>
                        </div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                          Premium
                        </h3>
                      </div>
                      <Chip
                        classNames={{
                          base: "bg-background text-foreground rounded-none",
                          content:
                            "font-bold text-xs uppercase tracking-widest",
                        }}
                      >
                        Active
                      </Chip>
                    </div>

                    {user?.subscription_period_end && (
                      <p className="mt-4 text-sm opacity-60">
                        Your subscription renews on{" "}
                        <span className="font-bold">
                          {formatDate(user.subscription_period_end)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="border border-default-200 p-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-default-500">
                      Your Premium Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "AI Outfit Generator",
                        "Magic Background Removal",
                        "Weather-Smart Suggestions",
                        "Unlimited Collections",
                        "Cost-Per-Wear Analytics",
                        "Priority Support",
                      ].map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircleIcon className="w-4 h-4 text-success" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manage Button */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="bordered"
                      radius="none"
                      className="uppercase font-bold tracking-widest"
                      isLoading={portalLoading}
                      onPress={handleManageSubscription}
                    >
                      Manage Subscription
                    </Button>
                    <p className="text-xs text-default-400 self-center">
                      Update payment method, view invoices, or cancel
                    </p>
                  </div>
                </div>
              ) : (
                // Free User View
                <div className="space-y-6">
                  {/* Status Card */}
                  <div className="border border-default-200 p-8">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-default-500">
                          Current Plan
                        </span>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                          Free
                        </h3>
                      </div>
                      <Chip
                        variant="flat"
                        classNames={{
                          base: "bg-default-100 rounded-none",
                          content:
                            "font-bold text-xs uppercase tracking-widest text-default-500",
                        }}
                      >
                        Basic
                      </Chip>
                    </div>
                  </div>

                  {/* Upgrade Prompt */}
                  <div className="border border-dashed border-default-300 p-8 text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mx-auto">
                      <SparklesIcon className="w-8 h-8 text-default-400" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xl font-bold">
                        Unlock Premium Features
                      </h4>
                      <p className="text-default-500 text-sm max-w-md mx-auto">
                        Get AI-powered outfit recommendations, magic background
                        removal, weather-smart styling, and more.
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <Button
                        color="primary"
                        radius="none"
                        size="lg"
                        className="uppercase font-bold tracking-widest px-12"
                        onPress={() => router.push("/pricing")}
                      >
                        Upgrade to Premium
                      </Button>
                      <span className="text-xs text-default-400">
                        Starting at $4.92/month billed annually
                      </span>
                    </div>
                  </div>

                  {/* Feature Comparison */}
                  <div className="border border-default-200 p-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-default-500 mb-4">
                      What You're Missing
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          feature: "AI Outfit Generator",
                          desc: "Daily looks curated for your weather & events",
                        },
                        {
                          feature: "Magic Background Removal",
                          desc: "One-click clean, professional item photos",
                        },
                        {
                          feature: "Weather Intelligence",
                          desc: "Never be too cold or too hot again",
                        },
                      ].map((item) => (
                        <div
                          key={item.feature}
                          className="flex items-start gap-3 p-3 bg-default-50"
                        >
                          <SparklesIcon className="w-4 h-4 text-default-400 mt-0.5" />
                          <div>
                            <span className="font-bold text-sm">
                              {item.feature}
                            </span>
                            <p className="text-xs text-default-500">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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

          {/* USER PREFERENCES SECTION */}
          {activeTab === "preferences" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-6 h-6" /> Preferences
                </h2>
                <Divider className="my-4" />

                {prefLoading ? (
                  <div className="w-full h-40 flex items-center justify-center text-default-400">
                    Loading preferences...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT COLUMN: General & Location */}
                    <div className="space-y-6">
                      <h3 className="font-semibold text-default-500 uppercase text-xs tracking-wider">
                        General Settings
                      </h3>

                      <Input
                        type="number"
                        label="Monthly Budget Goal"
                        placeholder="0.00"
                        variant="bordered"
                        radius="none"
                        value={prefData.budgetGoal.toString()}
                        onChange={(e) =>
                          setPrefData({
                            ...prefData,
                            budgetGoal: parseFloat(e.target.value) || 0,
                          })
                        }
                        startContent={
                          <span className="text-default-400 text-small">$</span>
                        }
                      />

                      <div className="flex gap-4">
                        <Input
                          type="text"
                          label="City"
                          variant="bordered"
                          radius="none"
                          value={prefData.location_city}
                          onChange={(e) =>
                            setPrefData({
                              ...prefData,
                              location_city: e.target.value,
                            })
                          }
                        />
                        <Input
                          type="text"
                          label="Country"
                          variant="bordered"
                          radius="none"
                          value={prefData.location_country}
                          onChange={(e) =>
                            setPrefData({
                              ...prefData,
                              location_country: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="pt-2">
                        <RadioGroup
                          label="Temperature Unit"
                          orientation="horizontal"
                          value={prefData.temperature_unit}
                          onValueChange={(val) =>
                            setPrefData({ ...prefData, temperature_unit: val })
                          }
                        >
                          <Radio value="celsius">Celsius (°C)</Radio>
                          <Radio value="fahrenheit">Fahrenheit (°F)</Radio>
                        </RadioGroup>
                      </div>

                      <Divider className="my-2" />

                      <h3 className="font-semibold text-default-500 uppercase text-xs tracking-wider">
                        Notifications
                      </h3>
                      <div className="flex flex-col gap-3">
                        <Switch
                          isSelected={prefData.notifications?.email}
                          onValueChange={(val) =>
                            updateJsonField("notifications", "email", val)
                          }
                        >
                          Email Alerts
                        </Switch>
                        <Switch
                          isSelected={prefData.notifications?.push}
                          onValueChange={(val) =>
                            updateJsonField("notifications", "push", val)
                          }
                        >
                          Push Notifications
                        </Switch>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Goals & Metadata */}
                    <div className="space-y-6">
                      <h3 className="font-semibold text-default-500 uppercase text-xs tracking-wider">
                        Style & Sustainability
                      </h3>

                      <Select
                        label="Style Goals"
                        placeholder="Select your styles"
                        selectionMode="multiple"
                        variant="bordered"
                        radius="none"
                        selectedKeys={prefData.styleGoals}
                        onSelectionChange={(keys) =>
                          setPrefData({
                            ...prefData,
                            styleGoals: new Set(keys as unknown as string[]),
                          })
                        }
                      >
                        {STYLE_OPTIONS.map((style) => (
                          <SelectItem key={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </Select>

                      <div className="flex flex-col gap-3 p-4 border border-default-200">
                        <span className="text-small text-default-500">
                          Sustainability Focus
                        </span>
                        {SUSTAINABILITY_OPTIONS.map((opt) => (
                          <Switch
                            key={opt.key}
                            size="sm"
                            isSelected={!!prefData.sustainabilityGoals[opt.key]}
                            onValueChange={(val) =>
                              updateJsonField(
                                "sustainabilityGoals",
                                opt.key,
                                val,
                              )
                            }
                          >
                            {opt.label}
                          </Switch>
                        ))}
                      </div>

                      <Select
                        label="Analytics Privacy"
                        variant="bordered"
                        radius="none"
                        selectedKeys={[prefData.analyticsPrivacy]}
                        onChange={(e) =>
                          setPrefData({
                            ...prefData,
                            analyticsPrivacy: e.target.value,
                          })
                        }
                      >
                        <SelectItem key="private">Private</SelectItem>
                        <SelectItem key="shared">Share Anonymously</SelectItem>
                        <SelectItem key="public">Public</SelectItem>
                      </Select>
                    </div>

                    <div className="col-span-1 md:col-span-2 pt-4 flex justify-end">
                      <Button
                        color="primary"
                        radius="none"
                        className="uppercase font-bold tracking-widest px-8 shadow-lg shadow-primary/20"
                        isLoading={loading}
                        onPress={handleSavePreferences}
                      >
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
