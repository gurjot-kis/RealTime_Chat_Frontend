"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser } from "@/features/auth/authSlice";
import { useUpdateProfileMutation, useUploadAvatarMutation } from "@/features/auth/authApi";
import UserAvatar from "../shared/UserAvatar";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();

  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Initialize fields with current user details when modal opens
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name);
      setGender(user.gender);
      setBio(user.bio || "Hey there! I am using Chat.");
      setAvatarPreview(user.avatar || null);
      setAvatarFile(null);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      let finalAvatarUrl = user?.avatar || "";

      // 1. If avatar changed, upload it first
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadRes = await uploadAvatar(formData).unwrap();
        if (uploadRes.success) {
          finalAvatarUrl = uploadRes.data.avatarUrl;
        }
      }

      // 2. Call the updateProfile API
      const response = await updateProfile({
        name: name.trim(),
        gender,
        bio: bio.trim(),
        avatar: finalAvatarUrl,
      }).unwrap();

      if (response.success && response.data) {
        dispatch(updateUser(response.data));
        toast.success("Profile updated successfully");
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 animate-fadeIn">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 dark:bg-gray-900 dark:border-gray-800">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-500">
          <h2 className="text-lg font-bold text-white">Edit Profile</h2>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Avatar Edit */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div
              onClick={() => document.getElementById("edit-avatar-input")?.click()}
              className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-emerald-300/70 bg-emerald-50/50 transition-all hover:border-emerald-400 hover:bg-emerald-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-emerald-500/60 ring-4 ring-transparent hover:ring-emerald-500/10"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview.startsWith("blob:") ? avatarPreview : `${process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"}${avatarPreview}`}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-emerald-400 group-hover:text-emerald-500">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[10px] font-medium mt-1">Change</span>
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-xs font-semibold text-white">Change</span>
              </div>
            </div>
            <input
              id="edit-avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Name Field */}
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />

          {/* Gender Select */}
          <Select
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]}
          />

          {/* Bio Field */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">About / Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full min-h-[80px] px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 resize-none transition-all duration-200"
              maxLength={150}
            />
            <span className="text-right text-[10px] text-gray-400">{bio.length}/150</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 rounded-full transition"
            >
              Cancel
            </button>
            <Button
              type="submit"
              loading={isSaving || isUploading}
              className="px-5 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-md shadow-emerald-500/20"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
