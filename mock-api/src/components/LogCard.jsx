import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function LogCard({ log }) {

    const { timestamp, method, path, latency, status, matched_response } = log;

    // Method's color
    const methodColors = {
        GET: "bg-green-100 text-green-700",
        POST: "bg-blue-100 text-blue-700",
        PUT: "bg-orange-100 text-orange-700",
        DELETE: "bg-red-100 text-red-700",
    };

    // Status's color
    // const statusColors = {
    //     200: "text-green-600",
    //     201: "text-green-600",
    //     400: "text-yellow-600",
    //     401: "text-yellow-600",
    //     403: "text-yellow-600",
    //     404: "text-orange-600",
    //     500: "text-red-600",
    // };

    return (
        <TableRow>
            <TableCell>
                {new Date(timestamp).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })}
            </TableCell>
            <TableCell>
                <Badge className={`${methodColors[method] || "bg-gray-100 text-gray-700"} px-2 py-0.5`}>
                    {method}
                </Badge>
            </TableCell>
            <TableCell className="font-mono text-sm">{path}</TableCell>
            <TableCell>{latency || "-"}</TableCell>
            <TableCell className={`[status] || "text-gray-600"}`}>
                {status}
            </TableCell>
            <TableCell>{matched_response || "-"}</TableCell>
        </TableRow>
    );
}
