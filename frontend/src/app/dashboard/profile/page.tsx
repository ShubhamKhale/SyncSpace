"use client";
import Image from "next/image";
import React, { useRef, useState } from "react";

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file (PNG, JPG, JPEG)");
    }
  };

  return (
    <div className="bg-gray-100 h-screen pt-5 pl-6 pr-8 pb-8">
      <p className="text-[var(--primary-text-color)] font-semibold text-xl">
        Profile
      </p>

      <div className="rounded-lg mt-5 pl-3 pb-8 mr-40 bg-white shadow">
        <div className="py-4 px-3 space-y-2 border-b border-b-[var(--sidebar-option-background-color)]">
          <p className="font-medium text-base text-[var(--primary-text-color)]">
            Personal Information
          </p>
          <p className="text-xs text-[var(--tertiary-text-color)]">
            Update your profile information visible to other users.
          </p>
        </div>

        <div className="py-4 px-3 space-y-2">
          <div className="flex items-center space-x-5">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-[50px] h-[50px] rounded-full object-cover"
              />
            ) : (
              <p className="w-[50px] h-[50px] p-12 flex items-center justify-center text-center rounded-full bg-[var(--sidebar-border-color)] text-[var(--tertiary-text-color)]">
                J
              </p>
            )}

            <div className="space-y-2">
              <div
                className="rounded-md border px-4 py-2 hover:cursor-pointer"
                onClick={handleAvatarClick}
              >
                <p className="text-xs font-medium text-[var(--quaternary-text-color)]">
                  Change avatar
                </p>
              </div>
              <p className="text-xs text-[var(--tertiary-text-color)]">
                PNG, JPG, JPEG up to 1MB
              </p>

              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="py-4 px-3 space-y-2">
            <p className="font-medium text-base text-[var(--primary-text-color)]">
              Name
            </p>
            <input
              className="p-3 text-xs text-[var(--tertiary-text-color)] border rounded w-full"
              type="text"
              placeholder="John Smith"
            />
          </div>

          <div className="py-4 px-3 space-y-2">
            <p className="font-medium text-base text-[var(--primary-text-color)]">
              Bio
            </p>
            <input
              className="p-3 text-xs text-[var(--tertiary-text-color)] border rounded w-full"
              type="text"
              placeholder="Product Designer at Design Co."
            />
          </div>

          <div className="flex justify-end pr-8">
            <button className=" mt-5 w-fit flex items-center justify-center space-x-3 rounded-md hover:cursor-pointer  px-6 py-2 bg-[var(--primary-button-background-color)] text-white text-center">
              <p>Save Profile</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
