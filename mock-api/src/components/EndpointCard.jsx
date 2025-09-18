import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { TableRow, TableCell } from "@/components/ui/table"

export default function EndpointRow({ endpoint, onEdit, onDelete, onClick }) {
    const { id, name, path, method } = endpoint

    return (
        <TableRow className="border-b border-gray-300">
            {/* Name + Actions */}
            <TableCell className="w-1/3 border-r border-gray-300">
                <div className="flex items-center justify-between">
          <span
              className="font-semibold text-gray-800 cursor-pointer"
              onClick={onClick}
          >
            {name}
          </span>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-blue-800 cursor-pointer"
                            onClick={() => onEdit(endpoint)}
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-500 hover:text-red-600 cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete
                                        endpoint data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="text-black hover:text-red-600">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                        onClick={() => onDelete(id)}
                                    >
                                        Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </TableCell>

            {/* Path */}
            <TableCell className="w-1/3 font-semibold text-gray-800 border-r border-gray-300">{path}</TableCell>

            {/* Method */}
            <TableCell className="w-1/6 text-center border-r border-gray-300">
                <Badge
                    className={`px-2 py-0.5 text-xs font-semibold rounded-sm ${
                        method === "GET"
                            ? "bg-emerald-100 text-black hover:bg-emerald-200"
                            : method === "POST"
                            ? "bg-indigo-300 text-black hover:bg-indigo-400"
                            : method === "PUT"
                            ? "bg-orange-400 text-black hover:bg-orange-500"
                            : method === "DELETE"
                            ? "bg-red-400 text-black hover:bg-red-500"
                            : "bg-gray-100 text-black hover:bg-gray-200"
                    }`}
                >
                    {method}
                </Badge>
            </TableCell>

            {/* Created Time */}
            <TableCell className="w-1/6 font-semibold text-gray-800 whitespace-nowrap text-sm">
                {new Date(endpoint.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })}
            </TableCell>
        </TableRow>
    )
}
