import React from 'react'
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

const EndpointRow = ({ endpoint }) => {
  const getMethodBadgeVariant = (method) => {
    switch(method) {
      case 'GET': return 'success'
      case 'POST': return 'blue'
      case 'PUT': return 'warning'
      case 'DELETE': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="endpoint-row">
      <div className="row-cell">
        <div className="feature-info">
          <span>{endpoint.name}</span>
        </div>
        <div className="action-buttons">
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="row-cell">
        <Badge variant={getMethodBadgeVariant(endpoint.method)}>
          {endpoint.method}
        </Badge>
      </div>
      
      <div className="row-cell">
        <span>{endpoint.lastUpdated}</span>
      </div>
    </div>
  )
}

export default EndpointRow