import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import editIcon from "@/assets/light/Edit Icon.svg";
import deleteIcon from "@/assets/light/Trash Icon.svg";
// import statefulEndpoint from "@/assets/stateful.svg";
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
} from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from "@/components/ui/table";

export default function EndpointCard({ endpoint, onEdit, onDelete, onClick }) {
  const { id, name, path, method } = endpoint;

  return (
    <TableRow className="transition-colors">
      {/* Endpoint Name */}
      <TableCell
        className="py-3 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex flex-col">
          <span
            className="font-semibold"
          >
            {name}
          </span>
          <span className="text-sm">{path}</span>
        </div>
      </TableCell>

      {/* State */}
      <TableCell className="py-3 font-medium text-center">
        {endpoint.is_stateful ? "stateful" : "stateless"}
      </TableCell>

      {/* Method */}
      <TableCell className="py-3 text-center">
        <Badge
          className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
            method === "GET"
              ? "bg-lime-200 text-black hover:bg-lime-300"
              : method === "POST"
                ? "bg-sky-200 text-black hover:bg-sky-300"
                : method === "PUT"
                  ? "bg-pink-200 text-black hover:bg-pink-300"
                  : method === "DELETE"
                    ? "bg-rose-400 text-black hover:bg-rose-500"
                    : "bg-gray-200 text-black"
          }`}
        >
          {method}
        </Badge>
      </TableCell>

      {/* Status */}
      <TableCell className="py-3 text-emerald-400 font-semibold text-center">
        {endpoint.is_stateful ? "active"
          : endpoint.is_active ? "active"
            : "inactive"}
      </TableCell>

      {/* Time & Date */}
      <TableCell className="py-3 font-medium whitespace-nowrap text-sm text-center">
        {new Date(endpoint.created_at).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className=""
            onClick={() => onEdit(endpoint)}
          >
            <img src={editIcon} alt="edit" className="w-4 h-4 dark:brightness-0 dark:invert" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
              >
                <img src={deleteIcon} alt="delete" className="w-4 h-4 dark:brightness-0 dark:invert" />
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
                  This action cannot be undone. This will permanently delete endpoint data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:text-red-600">
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
  );
}
