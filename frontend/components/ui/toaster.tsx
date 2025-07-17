"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Toast, ToastAction, ToastProvider, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()
  const { theme } = useTheme()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <div className="font-semibold">{title}</div>}
              {description && (
                <div className="text-sm opacity-90">{description}</div>
              )}
            </div>
            {action && <ToastAction altText={action.label} onClick={action.onClick}>{action.label}</ToastAction>}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
