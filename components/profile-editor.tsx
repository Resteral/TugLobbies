"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Upload, ImageIcon } from "lucide-react"
import { updateProfile, uploadProfileImage } from "@/lib/actions"

interface ProfileEditorProps {
  player: any
}

export default function ProfileEditor({ player }: ProfileEditorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: player.name || "",
    bio: player.bio || "",
    profile_picture: player.profile_picture || "",
    banner_image: player.banner_image || "",
  })

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (file: File, type: "profile" | "banner") => {
    if (!file) return

    setIsLoading(true)
    try {
      const imageUrl = await uploadProfileImage(file, player.id, type)
      setProfileData((prev) => ({
        ...prev,
        [type === "profile" ? "profile_picture" : "banner_image"]: imageUrl,
      }))
    } catch (error) {
      console.error("Upload failed:", error)
    }
    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    await updateProfile(player.id, profileData)
    setIsLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Banner Section */}
      <div className="relative">
        <div
          className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden"
          style={{
            backgroundImage: profileData.banner_image ? `url(${profileData.banner_image})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <label className="cursor-pointer bg-black/50 hover:bg-black/70 rounded-lg p-3 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, "banner")
                }}
              />
              <div className="flex items-center space-x-2 text-white">
                <ImageIcon className="h-5 w-5" />
                <span>Change Banner</span>
              </div>
            </label>
          </div>
        </div>

        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gray-600 rounded-full border-4 border-gray-900 overflow-hidden">
              {profileData.profile_picture ? (
                <img
                  src={profileData.profile_picture || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold">
                  {player.name?.[0] || "?"}
                </div>
              )}
            </div>
            <label className="absolute bottom-2 right-2 cursor-pointer bg-blue-600 hover:bg-blue-700 rounded-full p-2 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, "profile")
                }}
              />
              <Camera className="h-4 w-4 text-white" />
            </label>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-20 space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <Input
                value={profileData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Account ID</label>
              <Input value={player.starcraft_account_id || ""} disabled className="bg-gray-700" />
              <p className="text-xs text-gray-400 mt-1">Account ID cannot be changed</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Bio</label>
            <Textarea
              value={profileData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell others about yourself..."
              rows={4}
            />
          </div>
        </div>

        {/* Stats Display */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{player.elo_rating || 1000}</div>
              <div className="text-sm text-gray-400">ELO Rating</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{player.wins || 0}</div>
              <div className="text-sm text-gray-400">Wins</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{player.losses || 0}</div>
              <div className="text-sm text-gray-400">Losses</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{player.games_played || 0}</div>
              <div className="text-sm text-gray-400">Games Played</div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading} size="lg">
            <Upload className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
