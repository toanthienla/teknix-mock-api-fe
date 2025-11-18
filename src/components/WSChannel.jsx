import React, {useEffect, useState} from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";
import deleteIcon from "@/assets/light/delete.svg";
import lightningIcon from "@/assets/light/lightning.svg";
// import serverResponseIcon from "@/assets/light/server-response.svg";
import {highlight, languages} from "prismjs/components/prism-core.js";

import {getProjectConnectToken, testWsConnection} from "@/services/api.js";
import {toast} from "react-toastify";

export default function WSChannelSheet({
                                         open,
                                         onOpenChange,
                                         project,
                                         workspace,
                                         onDeleteWSChannel,
                                         onCopyURL,
                                       }) {
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [wsURL, setWsURL] = useState(null);
  const [projectToken, setProjectToken] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // const [responseBody, setResponseBody] = useState(null);

  // const jsonViewerRef = useRef(null);
  // const jsonEditor = useRef(null);

  // useEffect(() => {
  //   if (jsonViewerRef.current && open) {
  //     // Destroy old instance before re-render
  //     if (jsonEditor.current) jsonEditor.current.destroy();
  //
  //     jsonEditor.current = new JSONEditor(jsonViewerRef.current, {
  //       mode: "view",
  //       mainMenuBar: false,
  //       navigationBar: false,
  //       statusBar: false,
  //     });
  //     jsonEditor.current.set(responseBody);
  //   }
  //
  //   return () => {
  //     if (jsonEditor.current) jsonEditor.current.destroy();
  //   };
  // }, [open, responseBody]);

  useEffect(() => {
    if (open && project) {
      (async () => {
        try {
          const data = await getProjectConnectToken(project.id);
          setWsURL(data.ws_url);
          setProjectToken(data.token);
          // setResponseBody({
          //   result: {
          //     message: "Project token retrieved successfully",
          //     channels: data.channels,
          //     mode: data.mode,
          //   }
          // });
          toast.success("Project token retrieved successfully");
        } catch (error) {
          console.error("Failed to get project connect token:", error);
          // setResponseBody({
          //   error: "Failed to fetch project token",
          //   details: error.message
          // });
          toast.error("Failed to fetch project token");
        }
      })();
    }
  }, [open, project]);

  if (!project || !workspace) return null;

  const handleCopy = (url) => {
    onCopyURL(url);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="sheet-content folder-page-content !max-w-none w-[420px] sm:w-[500px] md:w-[600px] flex flex-col max-h-[100vh]"
        >
          <SheetHeader className={"shrink-0"}>
            <SheetTitle className="text-2xl font-bold">
              Real-time Updates via WebSocket
            </SheetTitle>
            <SheetDescription>
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 mt-4 overflow-y-auto space-y-4 text-sm pr-4">
            {/* Unsecured URL */}
            <div className="relative">
              <div className="ws-header text-xs font-mono px-4 py-1.5 rounded-t border flex justify-between items-center">
                <span className="opacity-70">text</span>
                <button
                  className="btn-primary text-xs px-2 py-1 rounded-xs"
                  onClick={() => handleCopy(wsURL || "")}
                >
                  Copy
                </button>
              </div>
              <div className="relative border border-t-0 rounded-b p-4 font-mono text-sm break-all">
                <span>
                  Websocket URL (Unsecured): {wsURL}
                </span>
              </div>
            </div>

            {/* Project Token */}
            <div className="relative">
              <div className="ws-header text-xs font-mono px-4 py-1.5 rounded-t border flex justify-between items-center">
                <span className="opacity-70">text</span>
                <button
                  className="btn-primary text-xs px-2 py-1 rounded-xs"
                  onClick={() => handleCopy(projectToken || "")}
                >
                  Copy
                </button>
              </div>
              <div className="relative border border-t-0 rounded-b p-4 font-mono text-xs break-all">
                {projectToken ? (
                  <span>
                    {projectToken}
                  </span>
                ) : (
                  <span className="opacity-70">Fetching project token...</span>
                )}
              </div>
            </div>

            {/* Test Button */}
            <div className="flex flex-col justify-center items-center">
              <button
                className="text-lg mt-2 btn-primary rounded-[44px]"
                disabled={!projectToken || isTesting}
                onClick={async () => {
                  setIsTesting(true);

                  try {
                    const r = await testWsConnection({
                      projectId: project.id,
                      note: "UI Test Connection",
                    });

                    // --- Nếu server trả về lỗi ---
                    if (!r.ok) {
                      // setResponseBody({
                      //   result: null,
                      //   error: "Test failed",
                      //   details: r.error || "Unknown error",
                      // });
                      toast.error("Test failed");
                      return;
                    }

                    // --- Nếu thành công ---
                    // setResponseBody({
                    //   result: {
                    //     status: "success",
                    //     channel: r.channel,
                    //     message: r.message || "Test connection successful",
                    //     payload: r.payload || {},
                    //   },
                    // });
                    toast.success("Test connection successful");

                  } catch (e) {
                    // fallback nếu testWsConnection ném exception thật
                    // setResponseBody({
                    //   error: "Test failed",
                    //   details: e.message,
                    // });
                    toast.error("Test failed: " + e.message || "Unknown error");
                  } finally {
                    setIsTesting(false);
                  }
                }}
              >
                <img
                  src={lightningIcon}
                  alt="Websocket"
                  className="w-32 h-32 transition duration-200 group-hover:brightness-0 group-hover:invert"
                />
              </button>
              <span className="mt-2">{isTesting ? "Testing..." : "Test Connection"}</span>
            </div>

            {/* === Connect Format (JSON style) === */}
            <div className="rounded-lg">
              <div className="ws-header text-xs font-mono px-4 py-1.5 rounded-t border flex justify-between items-center">
                <span className="opacity-70">json</span>
                <button
                  className="btn-primary text-xs px-2 py-1 rounded-xs"
                  onClick={() =>
                    handleCopy(JSON.stringify({ "id": 1, "connect": { "token": "..." } }))
                  }
                >
                  Copy
                </button>
              </div>
              <div
                className="custom-ws-json font-mono text-sm h-fit border border-t-0
                rounded-b-md p-2 overflow-auto"
                dangerouslySetInnerHTML={{
                  __html: (() => {
                    try {
                      const formatted = JSON.stringify({ id: 1, connect: { token: "..." }});
                      const highlighted = highlight(formatted, languages.json, "json");
                      return `<pre style="margin:0; white-space:pre;">${highlighted}</pre>`;
                    } catch (err) {
                      console.error("JSON format error:", err);
                      return "<pre style='color:red'>Invalid JSON</pre>";
                    }
                  })(),
                }}
              />
            </div>

            {/*/!* Server Response *!/*/}
            {/*<div className="rounded-lg">*/}
            {/*  <div className="btn-primary px-4 py-2 rounded-lg flex items-center mb-3">*/}
            {/*    <img*/}
            {/*      src={serverResponseIcon}*/}
            {/*      alt="Server Response"*/}
            {/*      className="w-4 h-4 mr-2"*/}
            {/*    />*/}
            {/*    <span className="">Server Response</span>*/}
            {/*  </div>*/}

            {/*  /!* JSON Viewer *!/*/}
            {/*  <div className="relative">*/}
            {/*    <div className="ws-header text-xs font-mono px-4 py-1.5 rounded-t border flex justify-between items-center">*/}
            {/*      <span className="opacity-70">json</span>*/}
            {/*      <button*/}
            {/*        className="btn-primary text-xs px-2 py-1 rounded-xs"*/}
            {/*        onClick={() => handleCopy(JSON.stringify(responseBody.result))}*/}
            {/*      >*/}
            {/*        Copy*/}
            {/*      </button>*/}
            {/*    </div>*/}
            {/*    /!* JSON Viewer (read-only, có highlight + format) *!/*/}
            {/*    <div*/}
            {/*      className="custom-ws-json font-mono text-sm h-fit border border-t-0*/}
            {/*      rounded-b-md p-2"*/}
            {/*      dangerouslySetInnerHTML={{*/}
            {/*        __html: (() => {*/}
            {/*          try {*/}
            {/*            let formattedData;*/}

            {/*            if (responseBody?.error) {*/}
            {/*              formattedData = JSON.stringify(*/}
            {/*                {*/}
            {/*                  error: responseBody.error,*/}
            {/*                  details: responseBody.details,*/}
            {/*                },*/}
            {/*                null,*/}
            {/*                2*/}
            {/*              );*/}
            {/*            } else if (responseBody?.result) {*/}
            {/*              formattedData = JSON.stringify(responseBody.result, null, 2);*/}
            {/*            } else {*/}
            {/*              formattedData = "[]";*/}
            {/*            }*/}

            {/*            const highlighted = highlight(formattedData, languages.json, "json");*/}
            {/*            return `<pre style="margin:0; white-space:pre;">${highlighted}</pre>`;*/}
            {/*          } catch (err) {*/}
            {/*            console.error("JSON format error:", err);*/}
            {/*            return "<pre style='color:red'>Invalid JSON</pre>";*/}
            {/*          }*/}
            {/*        })(),*/}
            {/*      }}*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*</div>*/}
            {/* Delete Button */}

            <div className="">
              <Button
                variant="destructive"
                className="group w-full flex items-center gap-2 justify-center
                text-red-500 hover:text-white bg-white hover:bg-red-500
                dark:text-white dark:bg-red-500 dark:hover:opacity-75
                        border border-red-500 transition-colors duration-200"
                onClick={() => setOpenDeleteConfirm(true)}
              >
                <img
                  src={deleteIcon}
                  alt="Delete"
                  className="w-4 h-4 transition duration-200 group-hover:brightness-0 group-hover:invert dark:brightness-0 dark:invert"
                />
                <span>Delete WS Channel</span>
              </Button>
            </div>
          </div>

          <SheetFooter>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* === Delete Confirm Dialog === */}
      <Dialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              Delete Confirm
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 flex flex-col space-y-2">
            <Button
              variant="destructive"
              onClick={() => {
                onDeleteWSChannel(project.id);
                setOpenDeleteConfirm(false);
              }}
            >
              Delete
            </Button>

            <Button
              variant="outline"
              className="font-semibold rounded-md py-2"
              onClick={() => setOpenDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
