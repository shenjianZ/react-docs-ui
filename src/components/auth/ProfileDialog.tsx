import { useEffect, useRef, useState } from "react"
import { Camera, Loader2, UserRound } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, updateProfile, uploadAvatar } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [username, setUsername] = useState("")
  const [nickname, setNickname] = useState("")
  const [bio, setBio] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !user) return
    setUsername(user.username || "")
    setNickname(user.nickname || "")
    setBio(user.bio || "")
    setFailedAvatarUrl(null)
  }, [open, user])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast({ description: "头像文件不能超过 2MB", variant: "destructive" })
      return
    }
    setUploadingAvatar(true)
    try {
      const message = await uploadAvatar(file)
      toast({ description: message || "头像上传成功" })
    } catch (err) {
      toast({ description: err instanceof Error ? err.message : "头像上传失败", variant: "destructive" })
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      const message = await updateProfile({ username, nickname, bio })
      toast({ description: message || "个人资料更新成功" })
      onOpenChange(false)
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "个人资料更新失败",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5" />
            个人资料
          </DialogTitle>
          <DialogDescription>这些信息会用于评论区的公开展示</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 头像上传 */}
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0">
              {user?.avatarUrl && user.avatarUrl !== failedAvatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="头像"
                  className="h-16 w-16 rounded-full object-cover"
                  onError={() => setFailedAvatarUrl(user.avatarUrl ?? null)}
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-medium">
                  {(user?.nickname || user?.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
                aria-label="更换头像"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              点击相机图标更换头像<br />支持 JPG、PNG、WEBP，不超过 2MB
            </p>
          </div>
          <ProfileInput label="邮箱" value={user?.email || ""} disabled />
          <ProfileInput label="用户名" value={username} onChange={setUsername} />
          <ProfileInput label="昵称" value={nickname} onChange={setNickname} />
          <label className="block space-y-2 text-sm">
            <span className="font-medium">个人简介</span>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="介绍一下你自己"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "保存资料"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ProfileInput(props: {
  label: string
  value: string
  disabled?: boolean
  onChange?: (value: string) => void
}) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="font-medium">{props.label}</span>
      <input
        value={props.value}
        disabled={props.disabled}
        onChange={(event) => props.onChange?.(event.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm disabled:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </label>
  )
}
