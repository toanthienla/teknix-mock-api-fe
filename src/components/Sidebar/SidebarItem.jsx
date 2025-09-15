import React from 'react'
import { ChevronRight } from 'lucide-react'

const SidebarItem = ({ icon, text, isActive = false, childrenItems = [] }) => {
  const [isExpanded, setIsExpanded] = React.useState(isActive)
  
  return (
    <li className={`sidebar-item ${isActive ? 'active' : ''}`}>
      <div 
        className="sidebar-item-header" 
        onClick={() => childrenItems.length > 0 && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          {icon}
          <span className="ml-2">{text}</span>
        </div>
        {childrenItems.length > 0 && (
          <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        )}
      </div>
      
      {isExpanded && childrenItems.length > 0 && (
        <ul className="sidebar-sublist">
          {childrenItems.map((item, index) => (
            <li key={index} className="sidebar-subitem">
              {item.icon}
              <span className="ml-2">{item.text}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export default SidebarItem