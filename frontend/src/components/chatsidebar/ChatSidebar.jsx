import {
  Sidebar,
  SidebarContent,
  SidebarFooter
} from "@/components/ui/sidebar"
import ChatPanel from "./ChatPanel";

export default function ChatSidebar({ ...props }) {
    return (
        <Sidebar variant="inset" {...props} side="right" className="sticky top-0 hidden h-svh border-l lg:flex"
        style={
            {
              "--sidebar-width": "350px",
              "--sidebar-width-icon": "60px",
            }
          }
        >
            <SidebarContent>
                <ChatPanel expanded={true} />
            </SidebarContent>
        </Sidebar>
    )
}