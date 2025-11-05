import {Card} from "@/components/ui/card.jsx";
import {Button} from "@/components/ui/button.jsx";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Code, SaveIcon} from "lucide-react";
import {highlight, languages} from "prismjs/components/prism-core.js";
import Editor from "react-simple-code-editor";
import {toast} from "react-toastify";
import React, {useState} from "react";
import {statusCodes} from "@/components/endpoint/constants.js";
import {API_ROOT} from "@/utils/constants.js";

export const WSConfig = ({config, endpointId}) => {

  const [enabled] = useState(config.enabled ?? false);
  const [message, setMessage] = useState(
    JSON.stringify(config.message ?? {}, null, 2)
  );
  const [delay, setDelay] = useState(config.delay_ms ?? 0);
  const [code, setCode] = useState(config.condition ?? 200);
  const [isSaving, setIsSaving] = useState(false);

  // Gọi API PUT /endpoints/:endpointId
  const handleSave = async () => {
    try {
      const parsedMessage = JSON.parse(message);
      const payload = {
        websocket_config: {
          enabled,
          message: parsedMessage,
          delay_ms: parseInt(delay, 10) || 0,
          condition: parseInt(code, 10),
        },
      };

      setIsSaving(true);
      const res = await fetch(`${API_ROOT}/endpoints/${endpointId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("WebSocket config updated successfully!");
      } else {
        const errText = await res.text();
        toast.error(`Failed to update config: ${errText}`);
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Invalid JSON or server error!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Card className="p-6 border-0 rounded-none shadow-none w-[80%]">
        <div className="space-y-2">
          {/* --- Header --- */}
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-[#000000]">WS Message</h2>
            <Button
              variant="outline"
              size="icon"
              disabled={isSaving}
              className="border-[#E5E5E1] hover:bg-yellow-50"
              onClick={handleSave}
            >
              <SaveIcon
                className={`h-5 w-5 ${
                  isSaving ? "animate-spin text-gray-400" : "text-[#898883]"
                }`}
              />
            </Button>
          </div>

          <div className="flex-1 w-full relative">
            <div className="relative">
              {/* --- JSON Editor for message --- */}
              <Editor
                className="custom-json-editor"
                value={message}
                onValueChange={(code) => setMessage(code)}
                highlight={(code) => highlight(code, languages.json)}
                padding={10}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 14,
                  minHeight: "120px",
                  backgroundColor: "#101728",
                  color: "white",
                  border: "1px solid #CBD5E1",
                  borderRadius: "0.375rem",
                  width: "100%",
                }}
              />

              {/*/!* JSON Editor controls *!/*/}
              {/*<div className="absolute top-2 right-2 flex space-x-2 z-10">*/}
              {/*  <Button*/}
              {/*    variant="outline"*/}
              {/*    size="sm"*/}
              {/*    className="border-[#E5E5E1] w-[77px] h-[29px] rounded-[6px] bg-white"*/}
              {/*    onClick={(e) => {*/}
              {/*      e.stopPropagation();*/}
              {/*      try {*/}
              {/*        const formatted = JSON.stringify(*/}
              {/*          JSON.parse(jsonStrings[index]),*/}
              {/*          null,*/}
              {/*          2*/}
              {/*        );*/}
              {/*        handleJsonChange(index, formatted);*/}
              {/*      } catch {*/}
              {/*        toast.error("Invalid JSON format");*/}
              {/*      }*/}
              {/*    }}*/}
              {/*  >*/}
              {/*    <Code className="mr-1 h-4 w-4"/> Format*/}
              {/*  </Button>*/}
              {/*</div>*/}
            </div>
          </div>

          {/* --- Delay --- */}
          <div className="flex justify-between items-center gap-1">
            <Label htmlFor="delay">WS Delay (ms)</Label>
            <Input
              id="delay"
              type="number"
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
              className="w-[70%]"
            />
          </div>

          {/* --- Code Dropdown --- */}
          <div className="flex justify-between items-center gap-1">
            <Label htmlFor="code">Code</Label>
            <Select value={String(code)} onValueChange={(v) => setCode(Number(v))}>
              <SelectTrigger className="w-[70%]">
                <SelectValue placeholder="Select Code"/>
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {statusCodes.map(({code, description}) => (
                  <SelectItem key={code} value={code}>
                    {code} - {description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
};
