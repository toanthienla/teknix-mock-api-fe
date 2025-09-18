import React from "react"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import editIcon from "@/assets/Edit Icon.svg";
import deleteIcon from "@/assets/Trash Icon.svg";
import {Pencil, Trash2} from "lucide-react"
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

export default function EndpointRow({ endpoint, onEdit, onDelete, onClick }) {
    const { id, name, path, method } = endpoint;

    return (
        <div className="grid grid-cols-12 items-center py-3 text-sm border-b border-gray-500 gap-4">
            {/* Name + Actions */}
            <div className="col-span-4 flex items-center justify-between">
                <span
                    className="font-medium text-gray-800 cursor-pointer"
                    onClick={onClick}
                >
                    {name}
                </span>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => onEdit(endpoint)}
                    >
                        <img src={editIcon} alt="edit" className="w-4 h-4" />
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-500 hover:text-red-600"
                            >
                               <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete endpoint data from our servers.
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

            {/* Path */}
            <div className="col-span-4 col-start-5">
                <span className="text-xs text-gray-500">{path}</span>
            </div>

            {/* Method */}
            <div className="col-start-9">
                <Badge
                    className={`px-2 py-0.5 text-xs font-semibold ${
                        method === "GET"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : method === "POST"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : method === "PUT"
                                    ? "bg-orange-100 text-orange-800 hover:bg-orange-100"
                                    : method === "DELETE"
                                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }`}
                >
                    {method}
                </Badge>
            </div>

            {/* Created Time */}
            <div className="col-span-3 col-start-10">
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                    {new Date(endpoint.created_at).toLocaleString("VN-vi", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                    })}
                </span>
            </div>
        </div>
    );
}
