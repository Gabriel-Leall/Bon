import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { TitleBar } from '@/components/titlebar/TitleBar'
import { LeftSideBar } from './LeftSideBar'
import { RightSideBar } from './RightSideBar'
import { MainWindowContent } from './MainWindowContent'
import { CommandPalette } from '@/components/command-palette/CommandPalette'
import { PreferencesDialog } from '@/components/preferences/PreferencesDialog'
import { Toaster } from 'sonner'
import { useTheme } from '@/hooks/use-theme'
import { useUIStore } from '@/store/ui-store'
import { useMainWindowEventListeners } from '@/hooks/useMainWindowEventListeners'
import { cn } from '@/lib/utils'
import { WrapUpDialog } from '@/components/wrap-up/WrapUpDialog'
import { useDailyWrapUpReminder } from '@/hooks/useDailyWrapUpReminder'

/**
 * Layout sizing configuration for resizable panels.
 * All values are percentages of total width.
 * Main + right sidebar defaults must equal 100.
 */
const LAYOUT = {
  rightSidebar: { default: 20, min: 15, max: 40 },
  main: { default: 80, min: 60 },
} as const

export function MainWindow() {
  const { resolvedTheme } = useTheme()
  const leftSidebarVisible = useUIStore(state => state.leftSidebarVisible)
  const rightSidebarVisible = useUIStore(state => state.rightSidebarVisible)

  // Set up global event listeners (keyboard shortcuts, etc.)
  useMainWindowEventListeners()
  useDailyWrapUpReminder()

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background">
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        <LeftSideBar className={cn(!leftSidebarVisible && 'hidden')} />

        <ResizablePanelGroup direction="horizontal" className="min-w-0 flex-1">
          <ResizablePanel
            defaultSize={LAYOUT.main.default}
            minSize={LAYOUT.main.min}
          >
            <MainWindowContent />
          </ResizablePanel>

          <ResizableHandle className={cn(!rightSidebarVisible && 'hidden')} />

          <ResizablePanel
            defaultSize={LAYOUT.rightSidebar.default}
            minSize={LAYOUT.rightSidebar.min}
            maxSize={LAYOUT.rightSidebar.max}
            className={cn(!rightSidebarVisible && 'hidden')}
          >
            <RightSideBar />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <div
        id="axis-active-focus-controller"
        data-slot="active-focus-controller-region"
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4 [&>*]:pointer-events-auto"
      />

      {/* Global UI Components (hidden until triggered) */}
      <CommandPalette />
      <PreferencesDialog />
      <WrapUpDialog />
      <Toaster
        position="bottom-right"
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
            description: 'group-[.toast]:text-muted-foreground',
            actionButton:
              'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
            cancelButton:
              'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          },
        }}
      />
    </div>
  )
}
