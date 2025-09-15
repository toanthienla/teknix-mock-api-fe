import React from 'react'
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'

const SearchBar = () => {
  return (
    <div className="search-bar">
      <Search className="search-icon" />
      <Input type="text" placeholder="Search all portals" className="search-input" />
    </div>
  )
}

export default SearchBar