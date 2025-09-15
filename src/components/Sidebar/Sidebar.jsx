import React from 'react'
import SidebarItem from './SidebarItem'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, Globe, Folder, Cog, Plus } from 'lucide-react'

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="text-2xl font-bold text-gray-800">MockAPI</h1>
        <Button variant="ghost" size="icon">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="sidebar-section">
        <h2 className="sidebar-section-title">WORKSPACES</h2>
        <ul className="sidebar-list">
          <SidebarItem icon={<Globe className="h-4 w-4" />} text="Workspace 1" />
          <SidebarItem 
            icon={<Folder className="h-4 w-4" />} 
            text="Project 1" 
            isActive 
            childrenItems={[
              { icon: <Cog className="h-4 w-4" />, text: "Get All User" },
              { icon: <Cog className="h-4 w-4" />, text: "Create New User" },
              { icon: <Cog className="h-4 w-4" />, text: "Get User By Id" },
              { icon: <Cog className="h-4 w-4" />, text: "Update User" },
              { icon: <Cog className="h-4 w-4" />, text: "Delete User" },
            ]} 
          />
          <SidebarItem icon={<Folder className="h-4 w-4" />} text="Project 2" />
          <SidebarItem icon={<Folder className="h-4 w-4" />} text="Project 3" />
        </ul>
      </div>

      <div className="sidebar-footer">
        <Card className="user-profile">
          <CardContent className="p-3">
            <div className="flex items-center">
              <div className="user-avatar"></div>
              <div className="user-info">
                <p className="user-name">hancontam</p>
                <p className="user-email">hancontam@gmail.com</p>
              </div>
              <Button variant="ghost" size="icon">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Sidebar

