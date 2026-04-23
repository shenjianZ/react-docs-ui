import { useState } from "react"
import { LogIn, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { LoginDialog } from "./LoginDialog"
import { ProfileDialog } from "./ProfileDialog"
import { RegisterDialog } from "./RegisterDialog"
import { buttonVariants } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    const message = await logout()
    toast({ description: message || "已退出登录" })
  }

  if (!isAuthenticated) {
    return (
      <>
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className={cn(buttonVariants({ variant: "ghost" }), "w-9 px-0")}
          aria-label="登录"
        >
          <LogIn className="h-5 w-5" />
        </button>
        <LoginDialog
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onSwitchToRegister={() => setRegisterOpen(true)}
        />
        <RegisterDialog
          open={registerOpen}
          onOpenChange={setRegisterOpen}
          onSwitchToLogin={() => setLoginOpen(true)}
        />
      </>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium hover:opacity-80 transition-opacity"
            aria-label="用户菜单"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>
                {(user?.nickname || user?.email || "U").charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5 text-sm font-medium truncate">
            {user?.email}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            个人资料
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}
