"use client"

import { useState, useEffect } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function EditProjectModal({ project, isOpen, onClose, onUpdateProject }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    background: "",
    owner: "tuongnghi",
    backgroundType: "color", // "color" hoặc "image"
  })

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        background: project.background || "",
        owner: project.owner,
        backgroundType: project.background && project.background.startsWith("data:image") ? "image" : "color",
      })
    }
  }, [project])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (project && formData.name.trim()) {
      onUpdateProject({
        ...project,
        ...formData,
      })
    }
  }

  const handleBackgroundUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setFormData((prev) => ({
          ...prev,
          background: ev.target.result,
          backgroundType: "image",
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  if (!project) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Project details</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                    id="background-upload-edit"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("background-upload-edit")?.click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  {formData.backgroundType === "image" && formData.background && (
                    <img
                      src={formData.background}
                      alt="Background preview"
                      className="mt-2 mx-auto h-16 object-cover rounded"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Owner</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">H</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">tuongnghi</p>
                    <p className="text-xs text-gray-500">tuongnghi04@gmail.com</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  maxLength={200}
                  className="resize-none"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.description.length}/200
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Update
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
