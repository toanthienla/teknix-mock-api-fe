"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function NewProjectModal({ isOpen, onClose, onCreateProject }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    background: "",
    owner: "tuognnghi",
    backgroundType: "color", // "color" hoặc "image"
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onCreateProject(formData)
      setFormData({ name: "", description: "", background: "", owner: "tuongnghi" })
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Project details</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <Input
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                    id="background-upload"
                  />
                  <label htmlFor="background-upload" className="cursor-pointer">
                    <div className="text-gray-500">
                      <p className="text-sm">Drag and Drop or</p>
                      <Button
                        type="button"
                        variant="link"
                        className="text-blue-600 p-0 h-auto"
                        onClick={() =>
                          document.getElementById("background-upload")?.click()
                        }
                      >
                        browse your device
                      </Button>
                    </div>
                  </label>
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
                    <p className="text-sm font-medium text-gray-900">tuognnghi</p>
                    <p className="text-xs text-gray-500">tuongnghi@gmail.com</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  placeholder="Type here"
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
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
