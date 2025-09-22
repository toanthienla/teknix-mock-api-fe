import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function formatResponseBody(body) {
  if (!body) return "-";

  // Trường hợp có "error"
  if (body.error) return body.error;

  // Trường hợp có "status"
  if (body.status) return body.status;

  // Trường hợp có "users" là mảng
  if (Array.isArray(body.users)) {
    return body.users.map((u) => u.name || u.id).join(", ");
  }

  // Trường hợp có report (ví dụ daily report)
  if (body.report_date) {
    return `Report ${body.report_date}: ${body.sales} sales, ${body.orders} orders`;
  }

  // Trường hợp có theme setting
  if (body.theme) {
    return `Theme: ${body.theme}`;
  }

  // Trường hợp mặc định → stringify
  return JSON.stringify(body);
}

export default function LogCard({ log }) {
  const {
    created_at,
    request_method,
    request_path,
    latency_ms,
    response_status_code,
    response_body,
  } = log;

  return (
    <TableRow>
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
      <TableCell>{latency_ms || "-"}</TableCell>

      <TableCell className={response_status_code || "text-gray-600"}>
        {response_status_code}
      </TableCell>

      <TableCell className="font-mono text-xs">
        {formatResponseBody(response_body)}
      </TableCell>
    </TableRow>
  );
}
