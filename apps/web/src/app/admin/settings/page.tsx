"use client";

import { useState, useEffect } from "react";
import { Loader2, Key, Shield, Settings2, Eye, EyeOff, Save, ExternalLink, Calendar, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMe, useChangePassword, useSystemSettings, useUpdateSystemSetting } from "@/hooks/use-admin-api";
import type { SystemSetting } from "@/lib/admin-api";

// Setting metadata for UI display
const SETTING_CONFIG: Record<string, { label: string; icon: React.ReactNode; placeholder: string; type: "url" | "text" | "secret" }> = {
  resume_url: {
    label: "Resume/CV URL",
    icon: <ExternalLink className="w-4 h-4" />,
    placeholder: "https://example.com/resume.pdf",
    type: "url",
  },
  calendly_link: {
    label: "Calendly Link",
    icon: <Calendar className="w-4 h-4" />,
    placeholder: "https://calendly.com/your-username",
    type: "url",
  },
  github_username: {
    label: "GitHub Username",
    icon: <Github className="w-4 h-4" />,
    placeholder: "your-github-username",
    type: "text",
  },
  github_token: {
    label: "GitHub Token",
    icon: <Key className="w-4 h-4" />,
    placeholder: "ghp_xxxxxxxxxxxxxxxxxxxx",
    type: "secret",
  },
};

export default function SettingsPage() {
  const { data: admin } = useMe();
  const { mutate: changePassword, isPending } = useChangePassword();
  const { data: systemSettings, isLoading: isLoadingSettings } = useSystemSettings();
  const { mutate: updateSetting, isPending: isUpdating } = useUpdateSystemSetting();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // System settings state
  const [settingValues, setSettingValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [settingSuccess, setSettingSuccess] = useState<Record<string, boolean>>({});

  // Initialize setting values when data loads
  useEffect(() => {
    if (systemSettings) {
      const values: Record<string, string> = {};
      systemSettings.forEach((setting: SystemSetting) => {
        // Don't show masked values, leave empty for sensitive
        values[setting.key] = setting.is_sensitive && setting.value === "********" ? "" : setting.value;
      });
      setSettingValues(values);
    }
  }, [systemSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    changePassword(
      {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      },
      {
        onSuccess: () => {
          setSuccess("Password changed successfully");
          setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        },
        onError: (err: unknown) => {
          if (err && typeof err === "object" && "response" in err) {
            const axiosError = err as { response?: { data?: { detail?: string } } };
            setError(axiosError.response?.data?.detail || "Failed to change password");
          } else {
            setError("Failed to change password");
          }
        },
      }
    );
  };

  const handleSettingUpdate = (key: string) => {
    const value = settingValues[key];

    // Don't update if the value is empty and it was a masked value
    if (!value && systemSettings?.find((s: SystemSetting) => s.key === key)?.is_sensitive) {
      return;
    }

    updateSetting(
      { key, data: { value } },
      {
        onSuccess: () => {
          setSettingSuccess((prev) => ({ ...prev, [key]: true }));
          setTimeout(() => {
            setSettingSuccess((prev) => ({ ...prev, [key]: false }));
          }, 2000);
        },
      }
    );
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      {/* System Settings */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="font-medium">Agent Tool Settings</h2>
            <p className="text-sm text-zinc-500">Configure URLs and tokens for AI agent tools</p>
          </div>
        </div>

        {isLoadingSettings ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            <span className="ml-2 text-sm text-zinc-500">Loading settings...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {systemSettings?.map((setting: SystemSetting) => {
              const config = SETTING_CONFIG[setting.key] || {
                label: setting.key,
                icon: <Settings2 className="w-4 h-4" />,
                placeholder: "",
                type: "text" as const,
              };
              const isSecret = config.type === "secret";
              const showValue = showSecrets[setting.key];

              return (
                <div key={setting.key} className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                    {config.icon}
                    {config.label}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={isSecret && !showValue ? "password" : "text"}
                        value={settingValues[setting.key] || ""}
                        onChange={(e) =>
                          setSettingValues((prev) => ({
                            ...prev,
                            [setting.key]: e.target.value,
                          }))
                        }
                        placeholder={config.placeholder}
                        className="bg-zinc-800/50 border-zinc-700 pr-10"
                      />
                      {isSecret && (
                        <button
                          type="button"
                          onClick={() => toggleShowSecret(setting.key)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                          {showValue ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSettingUpdate(setting.key)}
                      disabled={isUpdating}
                      className={
                        settingSuccess[setting.key]
                          ? "bg-green-500 hover:bg-green-400 text-black"
                          : "bg-purple-500 hover:bg-purple-400 text-black"
                      }
                    >
                      {settingSuccess[setting.key] ? (
                        "Saved!"
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {setting.description && (
                    <p className="text-xs text-zinc-600">{setting.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-medium">Account Information</h2>
            <p className="text-sm text-zinc-500">Your admin account details</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-zinc-500">Username</p>
            <p className="mt-1 font-mono">{admin?.username || "-"}</p>
          </div>
          <div>
            <p className="text-zinc-500">Last Login</p>
            <p className="mt-1">
              {admin?.last_login
                ? new Date(admin.last_login).toLocaleString()
                : "Never"}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Key className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-medium">Change Password</h2>
            <p className="text-sm text-zinc-500">Update your admin password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Current Password
            </label>
            <Input
              type="password"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              New Password
            </label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              required
              minLength={6}
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
              {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="bg-cyan-500 hover:bg-cyan-400 text-black"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
