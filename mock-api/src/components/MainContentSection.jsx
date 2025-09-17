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
  Menu,
  X
} from 'lucide-react';

const statusCodeData = [
  {
    code: "200",
    name: "Success Response",
    isDefault: true,
    bgColor: "bg-slate-100",
  },
  {
    code: "404",
    name: "Not Found",
    isDefault: false,
    bgColor: "",
  },
  {
    code: "500",
    name: "Internal Server Error",
    isDefault: false,
    bgColor: "",
  },
];

const EndpointDetail = () => {
  const [isActive, setIsActive] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [responseName, setResponseName] = useState('');
  const [statusCode, setStatusCode] = useState('200');
  const [headerKey, setHeaderKey] = useState('Content-Type');
  const [headerValue, setHeaderValue] = useState('application/json');
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
  const [delay, setDelay] = useState('0');

  const handleCreateResponse = () => {
    console.log({
      responseName,
      statusCode,
      headers: { [headerKey]: headerValue },
      body: responseBody,
      delay
    });
    
    setIsDialogOpen(false);
    setResponseName('');
    setStatusCode('200');
    setHeaderKey('Content-Type');
    setHeaderValue('application/json');
    setResponseBody('');
    setDelay('0');
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gradient-to-b from-[#F1F5F9] to-[#F1F5F9] p-8">
      <div className="w-[1280px] max-w-[1280px] h-[850px] bg-white shadow-lg rounded-2xl flex">
        {/* Sidebar */}
        <div className="w-[280px] h-full border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">MockAPI</h1>
              <Button variant="ghost" size="icon">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <h2 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">WORKSPACES</h2>
            <ul className="space-y-2">
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

          <div className="p-6 border-t border-gray-200">
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

        {/* Status Code Table */}
        <Card className="p-4 border border-[#CBD5E1] rounded-lg">
          <h3 className="text-xl font-semibold text-[#37352F] mb-4">Response Configurations</h3>
          {statusCodeData.map((item, index) => (
            <div key={index} className={`border-b border-neutral-200 ${item.bgColor} py-4`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge className={item.code === "200" ? "bg-green-100 text-green-800" : item.code === "404" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                    {item.code}
                  </Badge>
                  {item.isDefault && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Default
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="icon">
                  <Ellipsis className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              <div className="text-sm font-medium mt-2">{item.name}</div>
            </div>
          ))}
        </Card>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search all portals" 
                className="pl-10 bg-[#F1F5F9] border-0" 
              />
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                className="bg-[#2563EB] hover:bg-[#1E40AF] text-white" 
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> New response
              </Button>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  className="data-[state=checked]:bg-[#2563EB]"
                />
                <Label className="text-sm font-medium text-[#0A0A0A]">Is Active</Label>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-transparent">
                <TabsTrigger 
                  value="summary" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-[#37352F] data-[state=active]:shadow-none rounded-none"
                >
                  Summary
                </TabsTrigger>
                <TabsTrigger 
                  value="submissions" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-[#37352F] data-[state=active]:shadow-none rounded-none"
                >
                  Submissions
                </TabsTrigger>
              </TabsList>
              <TabsContent value="summary" className="mt-4">
                <div className="border-b-2 border-[#37352F] w-20"></div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Endpoint Detail Card */}
          <Card className="p-6 border border-[#CBD5E1] rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-[#37352F] mr-4">Get All Users</h2>
                <Badge variant="outline" className="bg-[#D5FBD3] text-[#000000] border-0">GET</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" className="border-[#E5E5E5]">
                  <Star className="h-4 w-4 text-[#898883]" />
                </Button>
                <Button variant="outline" size="icon" className="border-[#E5E5E5]">
                  <Trash2 className="h-4 w-4 text-[#898883]" />
                </Button>
              </div>
            </div>

            {/* Status Info */}
            <div className="border border-[#D1D5DB] rounded-md px-4 py-3 mb-6">
              <p className="text-[#777671] font-medium">Status: This endpoint is active and receiving requests</p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="response-name" className="text-right text-sm font-medium text-[#000000]">
                  Response Name
                </Label>
                <Input 
                  id="response-name" 
                  defaultValue="Default Response" 
                  className="col-span-3 border-[#CBD5E1] rounded-md" 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status-code" className="text-right text-sm font-medium text-[#000000]">
                  Status Code
                </Label>
                <Input 
                  id="status-code" 
                  defaultValue="200" 
                  className="col-span-3 border-[#CBD5E1] rounded-md" 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="response-header" className="text-right text-sm font-medium text-[#000000]">
                  Response Header
                </Label>
                <div className="col-span-3 flex space-x-2">
                  <Input 
                    id="header-key" 
                    placeholder="Key" 
                    defaultValue="Content-Type" 
                    className="border-[#CBD5E1] rounded-md" 
                  />
                  <Input 
                    id="header-value" 
                    placeholder="Value" 
                    defaultValue="application/json" 
                    className="border-[#CBD5E1] rounded-md" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Label htmlFor="response-body" className="text-right pt-2 text-sm font-medium text-[#000000]">
                  Response Body
                </Label>
                <div className="col-span-3 space-y-2">
                  <Textarea
                    id="response-body"
                    value={responseBody}
                    onChange={(e) => setResponseBody(e.target.value)}
                    className="font-mono h-60 border-[#CBD5E1] rounded-md"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" className="border-[#E5E5E5]">
                      <Upload className="mr-2 h-4 w-4" /> Upload
                    </Button>
                    <Button variant="outline" size="sm" className="border-[#E5E5E5]">
                      <Code className="mr-2 h-4 w-4" /> Format
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="delay" className="text-right text-sm font-medium text-[#000000]">
                  Delay (ms)
                </Label>
                <Input 
                  id="delay" 
                  defaultValue="0" 
                  className="col-span-3 border-[#CBD5E1] rounded-md" 
                />
              </div>

              <div className="flex justify-end">
                <Button className="bg-[#2563EB] hover:bg-[#1E40AF] text-white">Save Changes</Button>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* New Response Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Response</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="new-response-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Response Name
                </Label>
                <Input
                  id="new-response-name"
                  placeholder="Enter response name"
                  value={responseName}
                  onChange={(e) => setResponseName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="new-status-code" className="block text-sm font-medium text-gray-700 mb-2">
                  Status Code
                </Label>
                <Input
                  id="new-status-code"
                  placeholder="200"
                  value={statusCode}
                  onChange={(e) => setStatusCode(e.target.value)}
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Header
                </Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Key"
                    value={headerKey}
                    onChange={(e) => setHeaderKey(e.target.value)}
                  />
                  <Input
                    placeholder="Value"
                    value={headerValue}
                    onChange={(e) => setHeaderValue(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="new-response-body" className="block text-sm font-medium text-gray-700 mb-2">
                  Body
                </Label>
                <Textarea
                  id="new-response-body"
                  placeholder="Enter response body"
                  value={responseBody}
                  onChange={(e) => setResponseBody(e.target.value)}
                  className="h-32 font-mono"
                />
              </div>

              <div>
                <Label htmlFor="new-delay" className="block text-sm font-medium text-gray-700 mb-2">
                  Delay (ms)
                </Label>
                <Input
                  id="new-delay"
                  placeholder="0"
                  value={delay}
                  onChange={(e) => setDelay(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateResponse}>
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndpointDetail;