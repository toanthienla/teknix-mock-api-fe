import React from 'react'
import EndpointRow from './EndpointRow'
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'

const EndpointTable = () => {
  const endpoints = [
    { id: 1, name: "Get All Users", method: "GET", lastUpdated: "2 days ago" },
    { id: 2, name: "Create New User", method: "POST", lastUpdated: "5 days ago" },
    { id: 3, name: "Get User By Id", method: "GET", lastUpdated: "1 week ago" },
    { id: 4, name: "Update User", method: "PUT", lastUpdated: "2 weeks ago" },
    { id: 5, name: "Delete User", method: "DELETE", lastUpdated: "3 weeks ago" },
  ]

  return (
    <div className="endpoint-table-container">
      <div className="table-header">
        <div className="table-tabs">
          <button className="tab active">Summary</button>
          <button className="tab">Submissions</button>
        </div>
        
        <div className="table-actions">
          <div className="sort-dropdown">
            <span>Recently created</span>
          </div>
          
          <Button variant="outline" className="new-form-btn">
            <Plus className="mr-2 h-4 w-4" /> New form
          </Button>
        </div>
      </div>
      
      <div className="table-title">
        <h2>Endpoint Management</h2>
      </div>
      
      <div className="endpoint-table">
        <div className="table-headers">
          <div className="header-cell">Feature</div>
          <div className="header-cell">Category</div>
          <div className="header-cell">ETA</div>
        </div>
        
        {endpoints.map(endpoint => (
          <EndpointRow key={endpoint.id} endpoint={endpoint} />
        ))}
      </div>
    </div>
  )
}

export default EndpointTable