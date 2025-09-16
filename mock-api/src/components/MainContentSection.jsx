import React from "react";
import {
  Grid,
  Folder,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  SearchIcon,
  CopyIcon,
  MoreVerticalIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

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

export const MainContentSection = ({
  onNewResponse,
  onToggleActive,
  onSearch,
}) => {
  return (
    <div className="flex flex-col w-full items-start relative">
      <header className="flex items-center justify-between pl-[200px] pr-6 pt-6 pb-[25px] relative w-full border-b border-slate-200">
        <div className="flex flex-col max-w-md w-[400px] h-9 items-start justify-center relative">
          <div className="relative w-full h-9 bg-slate-100 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 absolute top-[9px] left-10">
              <SearchIcon className="w-5 h-5 text-[#777671]" />
              <Input
                placeholder="Search..."
                className="border-0 bg-transparent text-[#777671] font-semibold text-[15px] p-0 h-auto focus-visible:ring-0"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="inline-flex flex-col items-start pl-6 pr-0 py-0 relative">
          <div className="inline-flex items-center gap-3 relative">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-auto"
              onClick={onNewResponse}
            >
              New&nbsp;&nbsp;response
            </Button>
          </div>
        </div>

        <div className="inline-flex items-center absolute top-[29px] left-[709px]">
          <div className="inline-flex flex-col items-start gap-2.5 pl-0 pr-2 py-0 relative">
            <Switch
              defaultChecked
              className="w-11 h-6 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 data-[state=checked]:translate-x-5"
              onCheckedChange={onToggleActive}
            />
          </div>

          <div className="inline-flex items-center justify-center gap-2.5 relative">
            <div className="[font-family:'Inter',Helvetica] font-medium text-neutral-950 text-sm tracking-[0] leading-5 whitespace-nowrap">
              Is Active
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col items-start gap-6 pl-[15px] pr-2 pt-[15px] pb-[88px] relative flex-1 w-full grow overflow-scroll">
        <div className="flex w-[960px] items-center gap-4 px-[5.5px] py-0 relative">
          <div className="[font-family:'Inter',Helvetica] font-bold text-[#37352f] text-3xl tracking-[0] leading-[normal] whitespace-nowrap">
            Get All User
          </div>

          <Badge className="bg-[#d5fbd3] text-black hover:bg-[#d5fbd3] px-2.5 py-0.5 h-[22px]">
            Get
          </Badge>

          <div className="flex w-[707px] items-center gap-3.5 pl-[5px] pr-[9px] py-0 relative rounded-md border border-gray-300">
            <Input
              defaultValue="api/users"
              className="flex-1 border-0 [font-family:'Inter',Helvetica] font-semibold text-[#777671] text-base p-0 h-auto focus-visible:ring-0"
            />
            <CopyIcon className="w-[21px] h-[21px] text-gray-500" />
          </div>
        </div>

        <div className="relative w-[327px] h-[219px]">
          <Card className="w-[295px] h-[189px] left-4 relative top-[11px] border-slate-300">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-200">
                    <TableHead className="w-[119.2px] h-10 px-2 py-0 font-medium text-sm text-neutral-950">
                      Status Code
                    </TableHead>
                    <TableHead className="w-[270.55px] h-10 px-3 py-2 font-medium text-sm text-neutral-950">
                      Name Response
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusCodeData.map((item, index) => (
                    <TableRow
                      key={index}
                      className={`border-neutral-200 ${item.bgColor} relative`}
                    >
                      <TableCell className="w-[119.2px] h-[49px] p-2 font-medium text-sm text-neutral-950">
                        {item.code}
                      </TableCell>
                      <TableCell className="w-[200.55px] h-[49px] p-2 font-medium text-sm text-neutral-950 flex items-center">
                        {item.isDefault && (
                          <Badge className="mr-2 border-[#79787b] bg-transparent text-neutral-950 px-2.5 py-0.5 h-[22px]">
                            Default
                          </Badge>
                        )}
                        <span className="flex-1">{item.name}</span>
                      </TableCell>
                      <TableCell className="w-8 h-8 p-2">
                        <MoreVerticalIcon className="w-4 h-4" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="absolute w-[583px] h-[53px] top-[76px] left-[343px]">
          <Tabs defaultValue="rules" className="w-full">
            <TabsList className="bg-transparent h-auto p-0 gap-3">
              <TabsTrigger
                value="header-body"
                className="bg-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none [font-family:'Inter',Helvetica] font-semibold text-[#898883] text-[15px] data-[state=active]:text-[#37352f]"
              >
                Header&Body
              </TabsTrigger>
              <TabsTrigger
                value="rules"
                className="bg-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none [font-family:'Inter',Helvetica] font-semibold text-[#898883] text-[15px] data-[state=active]:text-[#37352f]"
              >
                Rules
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="absolute w-[638px] h-[616px] top-[111px] left-[353px]">
          <Card className="w-[638px] h-[616px] bg-white border-slate-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="font-large text-slate-900">
                  Success Response
                </div>
              </div>

              <div className="flex flex-col gap-[7px]">
                <div className="flex items-center gap-2 p-2 rounded-md border border-slate-300">
                  <Select defaultValue="query-parameter">
                    <SelectTrigger className="w-[168px] h-[29px] border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="query-parameter">
                        Query parameter
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    defaultValue="role"
                    className="w-[184px] h-[30px] border-slate-300 text-[13px]"
                  />

                  <div className="w-[31px] h-[29px] bg-[#2563eb1a] rounded-md border border-blue-600 flex items-center justify-center">
                    <span className="text-blue-600 text-[32px] leading-[18px]">
                      =
                    </span>
                  </div>

                  <Input
                    defaultValue="admin"
                    className="w-[151px] h-[30px] border-slate-300 text-[13px]"
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-7 h-[41px] p-0"
                  >
                    <img
                      className="w-7 h-[41px]"
                      alt="Frame"
                      src="/frame-78.svg"
                    />
                  </Button>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-md border border-slate-300">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 text-[#37352f] font-medium text-[15px]"
                    onClick={onNewResponse}
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
