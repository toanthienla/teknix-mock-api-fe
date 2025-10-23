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

  return (
    <TableRow>

      <TableCell className="font-mono text-sm">
        {log.endpointResponseName || "No response"}
      </TableCell>

      <TableCell>
        <Badge
          className={`px-2 py-0.5 text-xs font-semibold rounded-sm ${
            request_method === "GET"
              ? "bg-emerald-100 text-black hover:bg-emerald-200"
              : request_method === "POST"
                ? "bg-indigo-300 text-black hover:bg-indigo-400"
                : request_method === "PUT"
                  ? "bg-orange-400 text-black hover:bg-orange-500"
                  : request_method === "DELETE"
                    ? "bg-red-400 text-black hover:bg-red-500"
                    : "bg-gray-100 text-black hover:bg-gray-200"
          }`}
        >
          {request_method}
        </Badge>
      </TableCell>

      <TableCell className="font-mono text-sm">{request_path}</TableCell>

      <TableCell className={response_status_code || "text-gray-600"}>
        {response_status_code}
      </TableCell>

      <TableCell className="text-center">{latency_ms + " ms" || "-"}</TableCell>

      <TableCell>
        {new Date(created_at).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </TableCell>
    </TableRow>
  );
}
