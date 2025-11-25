import React from "react";
import {TableRow, TableCell} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";

export default function LogCard({log}) {
  const {
    created_at,
    request_method,
    request_path,
    latency_ms,
    response_status_code,
  } = log;

  const getStatusColor = (code) => {
    if (!code) return "#EDEDEC"; // neutral
    if (code >= 100 && code < 200) return "#A78BFA";
    if (code >= 200 && code < 300) return "#58F287";
    if (code >= 300 && code < 400) return "#60A5FA";
    if (code >= 400 && code < 500) return "#ED4245";
    if (code >= 500 && code < 600) return "#EF8843";
    return "#EDEDEC";
  };

  const statusColor = getStatusColor(Number(response_status_code));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} • ${timePart}`;
  };

  return (
    <TableRow>

      <TableCell className="text-sm">
        {log.endpointResponseName || "No response"}
      </TableCell>

      <TableCell className="text-center">
        <Badge
          className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
            request_method === "GET"
              ? "bg-lime-200 text-black hover:bg-lime-300"
              : request_method === "POST"
                ? "bg-sky-200 text-black hover:bg-sky-300"
                : request_method === "PUT"
                  ? "bg-pink-200 text-black hover:bg-pink-300"
                  : request_method === "DELETE"
                    ? "bg-rose-400 text-black hover:bg-rose-500"
                    : "bg-gray-200 text-black"
          }`}
        >
          {request_method}
        </Badge>
      </TableCell>

      <TableCell className="text-sm">
        <div className="bg-[#EDEDEC] dark:bg-[#202225] px-1.5 py-0.5 rounded-xs font-semibold">
          {request_path}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex ml-auto items-center bg-[#EDEDEC] dark:bg-[#2A2840] rounded-sm px-2 py-1 w-fit">
          <span
            className="w-2.5 h-2.5 rounded-full mr-2"
            style={{ backgroundColor: statusColor }}
          ></span>
          <span className="text-sm font-medium">
            {response_status_code || "-"}
          </span>
        </div>
      </TableCell>

      <TableCell className="text-center">{latency_ms + " ms" || "-"}</TableCell>

      <TableCell className="text-sm text-right">{formatDate(created_at)}</TableCell>
    </TableRow>
  );
}
