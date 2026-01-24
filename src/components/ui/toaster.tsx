"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props} 
            // Theme: Deep amber background, thick border, and dark text for readability
            className="group pointer-events-auto relative flex w-full items-center justify-between overflow-hidden rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 pr-8 shadow-lg transition-all"
          >
            <div className="grid gap-1">
              {title && (
                <ToastTitle className="text-sm font-black uppercase tracking-tight text-amber-950">
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className="text-xs font-medium text-amber-800/80">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="absolute right-2 top-2 rounded-md p-1 text-amber-950/50 opacity-100 transition-opacity hover:text-amber-950 focus:opacity-100 focus:outline-none" />
          </Toast>
        )
      })}
      {/* Viewport adjusted for mobile-first: Top Center */}
      <ToastViewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  )
}