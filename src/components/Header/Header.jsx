import React from 'react'
import SearchBar from './SearchBar'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from 'lucide-react'

const Header = () => {
  return (
    <div className="header">
      <SearchBar />
      
      <div className="header-actions">
        <Button className="new-project-btn">
          <Plus className="mr-2 h-4 w-4" /> Start all
        </Button>
        
        <div className="feature-badge">
          <Badge variant="secondary">feature</Badge>
          <span>Create a new project</span>
        </div>
      </div>
    </div>
  )
}

export default Header