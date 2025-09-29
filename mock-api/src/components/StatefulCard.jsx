import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import editIcon from "@/assets/Edit Icon.svg";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.jsx";
import deleteIcon from "@/assets/Trash Icon.svg";

// StatefulCard
// Props:
//  - stateful: object (stateful endpoint)
//  - onEdit: fn(stateful)
//  - onDelete: fn(id)
//  - onClick: fn(stateful)

export default function StatefulCard({ stateful = {}, onEdit, onDelete, onClick }) {
  const name = stateful.name || "—";
  const path = stateful.path || "—";
  const label =
    stateful.label || stateful.tag || (stateful.schema && stateful.schema.label) || "—";
  const status = stateful.is_active ? "active" : "inactive";

  const createdAt = stateful.created_at
    ? new Date(stateful.created_at).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    : "—";

  return (
    <TableRow className="border-b border-gray-200 hover:bg-slate-50">
      <TableCell className="w-1/4 py-3 border-r border-gray-300">
        <button
          onClick={() => onClick?.(stateful)}
          className="text-left font-medium text-gray-800 hover:underline truncate w-full text-sm"
          title={name}
        >
          {name}
        </button>
      </TableCell>

      <TableCell className="w-1/4 py-3 font-medium text-sm border-r border-gray-300 truncate">{path}</TableCell>

      <TableCell className="w-1/4 py-3 text-sm whitespace-nowrap border-r border-gray-300">{createdAt}</TableCell>

      <TableCell className="w-1/12 py-3 text-center text-sm border-r border-gray-300">
        <span
          className={`inline-block px-2 py-0.5 rounded-full font-semibold ${
            stateful.is_active ? "text-emerald-400" : "text-rose-600"
          }`}
        >
          {status}
        </span>
      </TableCell>

      <TableCell className="w-1/12 py-3 text-center text-sm border-r border-gray-300">{label}</TableCell>

      <TableCell className="w-1/12 text-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => onEdit(stateful)}
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
                  onDelete(stateful.id);
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
                  onClick={() => onDelete(stateful.id)}
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
