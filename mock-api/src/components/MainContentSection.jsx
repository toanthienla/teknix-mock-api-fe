import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  Search,
  Globe,
  Folder,
  Cog,
  Plus,
  ChevronRight,
  Ellipsis,
  Star,
  Trash2,
  Upload,
  Code,
  Settings,
  User,
  Mail,
  Bell,
  Menu
} from 'lucide-react';

const EndpointDetail = () => {
  const [isActive, setIsActive] = useState(true);
  const [responseBody, setResponseBody] = useState(`[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
]`);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-100 to-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-white p-6 fixed left-0 top-0 h-full border-r border-gray-200 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">MockAPI</h1>
          <Button variant="ghost" size="icon">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">WORKSPACES</h2>
          <ul className="space-y-1">
            <li className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">
              <Globe className="h-4 w-4 mr-3" />
              <span>Workspace 1</span>
            </li>
            <li className="flex items-center py-2 px-3 rounded-md bg-gray-100 text-gray-700 mt-1 cursor-pointer">
              <Folder className="h-4 w-4 mr-3" />
              <span>Project 1</span>
            </li>
            <li className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer pl-10">
              <Cog className="h-4 w-4 mr-3" />
              <span>Get All User</span>
            </li>
            <li className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer pl-10">
              <Cog className="h-4 w-4 mr-3" />
              <span>Create New User</span>
            </li>
            <li className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer pl-10">
              <Cog className="h-4 w-4 mr-3" />
              <span>Get User By Id</span>
            </li>
            <li className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer pl-10">
              <Cog className="h-4 w-4 mr-3" />
              <span>Update User</span>
            </li>
            <li className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer pl-10">
              <Cog className="h-4 w-4 mr-3" />
              <span>Delete User</span>
            </li>
            <li className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">
              <Folder className="h-4 w-4 mr-3" />
              <span>Project 2</span>
            </li>
            <li className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">
              <Folder className="h-4 w-4 mr-3" />
              <span>Project 3</span>
            </li>
          </ul>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-md mr-3"></div>
            <div>
              <p className="text-sm font-semibold">hancontam</p>
              <p className="text-xs text-gray-500">hancontam@gmail.com</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto">
              <Ellipsis className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-72 flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input type="text" placeholder="Search all portals" className="pl-10" />
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> New response
            </Button>
            <div className="flex items-center space-x-2">
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label>Is Active</Label>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
              <div className="border-b-2 border-gray-800 w-20 mb-4"></div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Endpoint Detail Card */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800 mr-4">Get All Users</h2>
              <Badge variant="outline" className="bg-green-100 text-green-800">GET</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status Info */}
          <div className="border border-gray-300 rounded-md px-4 py-3 mb-6">
            <p className="text-gray-600 font-medium">Status: This endpoint is active and receiving requests</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="response-name" className="text-right">
                Response Name
              </Label>
              <Input id="response-name" defaultValue="Default Response" className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status-code" className="text-right">
                Status Code
              </Label>
              <Input id="status-code" defaultValue="200" className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="response-header" className="text-right">
                Response Header
              </Label>
              <div className="col-span-3 flex space-x-2">
                <Input id="header-key" placeholder="Key" defaultValue="Content-Type" />
                <Input id="header-value" placeholder="Value" defaultValue="application/json" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="response-body" className="text-right pt-2">
                Response Body
              </Label>
              <div className="col-span-3 space-y-2">
                <Textarea
                  id="response-body"
                  value={responseBody}
                  onChange={(e) => setResponseBody(e.target.value)}
                  className="font-mono h-60"
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" /> Upload
                  </Button>
                  <Button variant="outline" size="sm">
                    <Code className="mr-2 h-4 w-4" /> Format
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delay" className="text-right">
                Delay (ms)
              </Label>
              <Input id="delay" defaultValue="0" className="col-span-3" />
            </div>

            <div className="flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EndpointDetail;