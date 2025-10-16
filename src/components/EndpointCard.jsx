import React from "react"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import editIcon from "@/assets/Edit Icon.svg";
import deleteIcon from "@/assets/Trash Icon.svg";
import statefulEndpoint from "@/assets/stateful.svg"
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
import {TableRow, TableCell} from "@/components/ui/table"

export default function EndpointRow({endpoint, onEdit, onDelete, onClick}) {
  const {id, name, path, method} = endpoint

  return (
    <TableRow className="border-b border-gray-300 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
      {/* Name */}
      <TableCell className="w-1/4 border-r border-gray-300">
        <div className="flex items-center gap-2">
          {endpoint.is_stateful && (
            <img
              src={statefulEndpoint}
              alt="stateful endpoint"
              className="w-5 h-5"
            />
          )}
          <span
            className="font-semibold text-gray-800 cursor-pointer"
            style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.25)"}}
            onClick={onClick}
          >
            {name}
          </span>
        </div>
      </TableCell>

      {/* Path */}
      <TableCell
        className="w-1/4 font-semibold text-gray-800 text-sha border-r border-gray-300"
        style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.25)" }}
      >
        {path}
      </TableCell>

      {/* Method */}
      <TableCell
        className="w-1/12 text-center border-r border-gray-300"
        style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.25)" }}
      >
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
      <TableCell
        className="w-1/4 font-semibold text-gray-800 whitespace-nowrap text-sm border-r border-gray-300"
        style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.25)" }}
      >
        {new Date(endpoint.created_at).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </TableCell>

      {/* Status */}
      <TableCell
        className="w-1/12 font-semibold text-center text-gray-800 whitespace-nowrap text-sm border-r border-gray-300"
        style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.25)" }}
      >
        <span
          className={`inline-block px-2 py-0.5 rounded-full font-semibold ${
            endpoint.is_active ? "text-emerald-400" : "text-rose-600"
          }`}
        >
          {endpoint.is_active ? "active" : "inactive"}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell className="w-1/12 text-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => onEdit(endpoint)}
          >
            <img src={editIcon} alt="edit" className="w-4 h-4"/>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-500 hover:text-red-600"
              >
                <img src={deleteIcon} alt="delete" className="w-4 h-4"/>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onDelete(id);
                }
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete endpoint data from
                  our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-black hover:text-red-600">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => onDelete(id)}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  )
}
