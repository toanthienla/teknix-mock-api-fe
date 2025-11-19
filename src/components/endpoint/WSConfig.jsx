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
import React, {useEffect, useState} from "react";
import {statusCodes} from "@/components/endpoint/constants.js";

export const WSConfig = ({ config, isStateful, method, onSave }) => {

  const statelessAllowed = statusCodes.map((c) => c.code); // Get all codes

  const statefulAllowed = [
    "100", "101", "102",
    "200", "201", "202", "204", "206",
    "302",
    "400", "401", "403", "404", "408",
    "409",
    "500", "503"
  ];

  const serverErrorCodes = ["500", "501", "502", "503", "504", "505"];

  const methodRules = {
    GET: [
      "200", "204", "206", "304",
      "400", "401", "403", "404",
      ...serverErrorCodes
    ],
    POST: [
      "200", "201", "202", "204",
      "400", "401", "403", "404",
      "409",
      ...serverErrorCodes
    ],
    PUT: [
      "200", "201", "204",
      "400", "401", "403", "404",
      "409",
      ...serverErrorCodes
    ],
    DELETE: [
      "200", "202", "204",
      "400", "401", "403", "404",
      "409",
      ...serverErrorCodes
    ]
  };

  const getStatusCodesByMethod = (method, isStateful) => {
    // Lấy rule theo method, nếu không có thì cho phép tất cả
    const allowedByMethod = methodRules[method] || statelessAllowed;

    // Lấy rule theo stateful
    const allowedByState = isStateful ? statefulAllowed : statelessAllowed;

    // Giao 2 list (method ∩ state)
    const finalAllowedCodes = allowedByMethod.filter((code) =>
      allowedByState.includes(code)
    );

    // Trả về object đúng format từ statusCodes gốc
    return statusCodes.filter((c) => finalAllowedCodes.includes(c.code));
  };

  const [enabled, setEnabled] = useState(config.enabled ?? false);
  const [message, setMessage] = useState(
    JSON.stringify(
      config.message === "" ? {} : (config.message ?? {}),
      null,
      2
    )
  );
  const [delay, setDelay] = useState(config.delay_ms ?? 0);
  const [code, setCode] = useState(config.condition ?? 200);

  const availableCodes = getStatusCodesByMethod(method, isStateful);

  useEffect(() => {
    setEnabled(config.enabled ?? false);

    setMessage(
      JSON.stringify(
        config.message === "" ? {} : (config.message ?? {}),
        null,
        2
      )
    );

    setDelay(config.delay_ms ?? 0);
    setCode(config.condition ?? 200);
  }, [config]);

  const [buttonShadow, setButtonShadow] = useState(false);
  function handleClick(callback, setShadow, duration = 100) {
    setShadow(true);

    callback();

    setTimeout(() => setShadow(false), duration);
  }

  // Gọi API PUT /endpoints/:endpointId
  const handleSave = () => {
    try {
      const parsedMessage = message.trim() === "" ? {} : JSON.parse(message);

      const payload = {
        enabled,
        message: parsedMessage,
        delay_ms: parseInt(delay, 10) || 0,
        condition: parseInt(code, 10),
      };

      onSave(payload);  // <-- gửi ra cho parent
    } catch (err) {
      toast.error("Invalid JSON!");
      console.error("Save WS Config error: " + err);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full">
      <Card className="p-6 border-0 rounded-none shadow-none w-[80%]">
        <div className="space-y-2">
          {/* --- Header --- */}
          <div className="btn-primary rounded-full border p-1 absolute top-2 right-4 flex space-x-2 z-10">
            <Button
              size="icon"
              className={`btn-primary rounded-full my-1 shadow-none 
                transition-all ${buttonShadow ? "shadow-md/30" : ""}
              `}
              onClick={() => handleClick(handleSave, setButtonShadow)}
            >
              <SaveIcon
                className="w-5 h-5"
              />
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="font-medium">WS Message</h2>
          </div>

          <div className="flex-1 w-full relative">
            <div className="relative">
              {/* --- JSON Editor for message --- */}
              <Editor
                className="custom-initial-value"
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
                  borderRadius: "0.375rem",
                  width: "100%",
                }}
              />

              {/* JSON Editor controls */}
              <div className="absolute top-2 right-2 flex space-x-2 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit h-[29px] rounded-sm bg-[#1a2131] text-white hover:bg-[#222838] hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      const formatted = JSON.stringify(JSON.parse(message), null, 2);
                      setMessage(formatted);
                      // toast.success("Formatted!");
                    } catch {
                      toast.error("Invalid JSON format");
                    }
                  }}
                >
                  <Code className="mr-1 h-4 w-4" /> Format
                </Button>
              </div>
            </div>
          </div>

          {/* --- Delay --- */}
          <div className="flex justify-between items-center gap-1">
            <Label htmlFor="delay">WS Delay (ms)</Label>
            <Input
              id="delay"
              type="number"
              min={0}
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
              <SelectContent className="max-h-[250px] overflow-y-auto">
                {availableCodes.map(({ code, description }) => (
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
