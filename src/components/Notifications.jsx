import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import bellIcon from "@/assets/notification.svg";
import expandIcon from "@/assets/expand.svg";
import { Badge } from "@/components/ui/badge";

export default function NotificationsSheet({ notifications = [], onMarkAllRead }) {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "unread"
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <img src={bellIcon} alt="bell" className="w-5 h-5" />
          {notifications.some((n) => !n.is_read) && (
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="!max-w-none w-[420px] sm:w-[500px] md:w-[600px] bg-white shadow-lg overflow-hidden pt-1.5"
      >
        {/* HEADER */}
        <SheetHeader className="flex flex-row justify-between items-center mb-3">
          <SheetTitle className="text-xl font-bold">Notifications</SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-md bg-none hover:bg-white mr-1"
          >
            <img src={expandIcon} alt="expand" className="w-4 h-4" />
          </Button>
        </SheetHeader>
        <SheetDescription></SheetDescription>

        {/* TABS + MARK ALL */}
        <div className="flex justify-between items-center mb-3 px-1">
          <div className="flex gap-4">
            <button
              className={`text-sm py-2 px-3 font-semibold rounded-lg ${
                activeTab === "all"
                  ? "bg-gray-100 text-black"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All <span className="text-black rounded-lg px-2.5 py-1 bg-yellow-300">{notifications.length}</span>
            </button>

            <button
              className={`text-sm py-2 px-3 font-semibold rounded-lg ${
                activeTab === "unread"
                  ? "bg-gray-100 text-black"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("unread")}
            >
              Unread
            </button>
          </div>

          <button
            className="text-sm underline font-semibold text-gray-600 hover:text-gray-900"
            onClick={onMarkAllRead}
          >
            Mark all as read
          </button>
        </div>

        {/* LIST */}
        <ScrollArea className="h-[80vh] pr-2">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-8">
              No notifications
            </p>
          ) : (
            filtered.map((n, index) => (
              <div
                key={index}
                className="p-4 mb-1 hover:bg-gray-50 transition border-b border-gray-300"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center mb-2 gap-2">
                    <Badge
                      className={`px-3 py-0.5 text-xs font-semibold rounded-md ${
                        n.method === "GET"
                          ? "bg-lime-200 text-black hover:bg-lime-300"
                          : n.method === "POST"
                            ? "bg-sky-300 text-black hover:bg-sky-400"
                            : n.method === "PUT"
                              ? "bg-pink-300 text-black hover:bg-pink-400"
                              : n.method === "DELETE"
                                ? "bg-red-400 text-white hover:bg-red-500"
                                : "bg-gray-200 text-black"
                      }`}
                    >
                      {n.method}
                    </Badge>
                    <p className="font-medium text-sm">
                      New request to {n.endpoint}
                    </p>
                  </div>

                  {!n.is_read && (
                    <span className="h-2 w-2 bg-red-500 rounded-full" />
                  )}
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">Status:</span> {n.status}
                  </p>
                  <p>
                    <span className="font-semibold">Stateful:</span>{" "}
                    {n.is_stateful ? "True" : "False"}
                  </p>
                  <p>
                    <span className="font-semibold">Request:</span>{" "}
                    <code>{n.request}</code>
                  </p>
                  <p>
                    <span className="font-semibold">Response:</span>{" "}
                    <code>{n.response}</code>
                  </p>
                </div>

                <div className="text-xs text-gray-400 mt-2 text-right">
                  {n.time} • {n.user}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
