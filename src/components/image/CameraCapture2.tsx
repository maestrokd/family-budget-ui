import * as React from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

type Props = {
    /** Preferred orientation when auto-choosing */
    facingMode?: "environment" | "user";
    /** Label for the base64 field */
    label?: string;
};

export function CameraCapture({facingMode = "environment", label = "Base64"}: Props) {
    // Upload (file picker)
    const uploadRef = React.useRef<HTMLInputElement | null>(null);

    // Video/camera
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const streamRef = React.useRef<MediaStream | null>(null);

    // Token to prevent racing start calls
    const startTokenRef = React.useRef(0);

    // Devices & selection
    const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    // UI state
    const [cameraOpen, setCameraOpen] = React.useState(false);
    const [viewerOpen, setViewerOpen] = React.useState(false);
    const [starting, setStarting] = React.useState(false);
    const [canSnap, setCanSnap] = React.useState(false);
    const [cameraError, setCameraError] = React.useState<string | null>(null);

    // Photo state
    const [dataUrl, setDataUrl] = React.useState<string | null>(null);
    const [base64, setBase64] = React.useState<string>("");

    // ---------- helpers ----------
    const stopStream = () => {
        streamRef.current?.getTracks()?.forEach((t) => t.stop());
        streamRef.current = null;
        setCanSnap(false);
        const v = videoRef.current;
        if (v) {
            v.srcObject = null;
        }
    };

    const toBase64 = (url: string) => {
        const i = url.indexOf(",");
        return i >= 0 ? url.slice(i + 1) : url;
    };

    const setFromDataUrl = (url: string) => {
        setDataUrl(url);
        setBase64(toBase64(url));
    };

    const pickPreferredDeviceId = (list: MediaDeviceInfo[]) => {
        if (!list.length) return null;
        // Try orientation by label
        const back = list.find((d) => /back|rear|environment/i.test(d.label));
        const front = list.find((d) => /front|user|face/i.test(d.label));
        if (facingMode === "environment" && back) return back.deviceId;
        if (facingMode === "user" && front) return front.deviceId;
        // Prefer non-virtual
        const nonVirtual = list.find((d) => !/virtual|obs|mmhmm|snap/i.test(d.label.toLowerCase()));
        return (nonVirtual ?? list[0]).deviceId;
    };

    const enumerateCameras = React.useCallback(async (): Promise<MediaDeviceInfo[]> => {
        if (!navigator.mediaDevices?.enumerateDevices) return [];
        const all = await navigator.mediaDevices.enumerateDevices();
        return all.filter((d) => d.kind === "videoinput");
    }, []);

    // ---------- start stream ----------
    const startForDevice = React.useCallback(
        async (deviceId: string | null) => {
            const token = ++startTokenRef.current; // mark this start attempt
            setStarting(true);
            setCameraError(null);
            setCanSnap(false);

            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error("Camera API not supported in this browser");
                }

                // Stop any previous stream before starting new one
                stopStream();

                const constraints: MediaStreamConstraints = deviceId
                    ? {video: {deviceId: {exact: deviceId}}, audio: false}
                    : {video: {facingMode: {ideal: facingMode}}, audio: false};

                const s = await navigator.mediaDevices.getUserMedia(constraints);

                // If another start began, discard this stream
                if (token !== startTokenRef.current) {
                    s.getTracks().forEach((t) => t.stop());
                    return;
                }

                streamRef.current = s;
                const v = videoRef.current!;
                v.srcObject = s;
                v.muted = true;
                v.playsInline = true;

                // Wait for metadata and at least a frame with non-zero dimensions
                await new Promise<void>((resolve) => {
                    const onMeta = () => {
                        v.removeEventListener("loadedmetadata", onMeta);
                        resolve();
                    };
                    if (v.readyState >= 1) resolve();
                    else v.addEventListener("loadedmetadata", onMeta, {once: true});
                });

                await v.play().catch(() => {
                });

                // Wait a couple of RAFs to ensure decoder produced frames
                await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

                if (v.videoWidth > 0 && v.videoHeight > 0) {
                    setCanSnap(true);
                } else {
                    // Try a tiny nudge (pause/play)
                    await v.pause();
                    await v.play().catch(() => {
                    });
                    setCanSnap(v.videoWidth > 0 && v.videoHeight > 0);
                }
            } catch (e) {
                if (token === startTokenRef.current) {
                    stopStream();
                    setCameraError(e instanceof Error ? e.message : "Failed to open camera");
                }
            } finally {
                if (token === startTokenRef.current) setStarting(false);
            }
        },
        [facingMode]
    );

    // ---------- open camera flow ----------
    const openCamera = async () => {
        setCameraOpen(true);

        try {
            // 1) Prime permission so labels populate (best-effort)
            try {
                await startForDevice(null);
            } catch {
                /* ignore */
            }

            // 2) Enumerate with labels
            const vids = await enumerateCameras();
            setDevices(vids);

            // 3) If no selection yet, pick a preferred one and start it
            const next = selectedId ?? pickPreferredDeviceId(vids);
            if (next && next !== selectedId) {
                setSelectedId(next);
                await startForDevice(next);
            } else if (!selectedId) {
                // Keep whatever stream we already started (from prime), if any
            } else {
                // If selection exists, ensure we are on it
                await startForDevice(selectedId);
            }
        } catch {
            // error handled inside startForDevice
        }
    };

    // Restart stream on device change while dialog is open
    React.useEffect(() => {
        if (!cameraOpen) return;
        if (selectedId == null) return;
        startForDevice(selectedId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, cameraOpen]);

    // Stop hardware when dialog closes or component unmounts
    React.useEffect(() => {
        if (!cameraOpen) stopStream();
        return () => stopStream();
    }, [cameraOpen]);

    // ---------- take photo ----------
    const takePhoto = async () => {
        const v = videoRef.current;
        if (!v || !canSnap) return;

        const w = v.videoWidth || 1280;
        const h = v.videoHeight || 720;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(v, 0, 0, w, h);
        const url = canvas.toDataURL("image/jpeg", 0.92);
        setFromDataUrl(url);

        setCameraOpen(false); // closes and releases tracks via effect
    };

    // ---------- upload flow ----------
    const onUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            e.target.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setFromDataUrl(reader.result as string);
        reader.readAsDataURL(file);
    };

    const copyBase64 = async () => {
        if (!base64) return;
        try {
            await navigator.clipboard.writeText(base64);
        } catch {
            /* ignore */
        }
    };

    const clearPhoto = () => {
        setDataUrl(null);
        setBase64("");
        if (uploadRef.current) uploadRef.current.value = "";
    };

    return (
        <div className="space-y-3">
            {/* Hidden file input */}
            <input
                ref={uploadRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onUploadChange}
                aria-label="Choose a photo"
            />

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={openCamera} aria-label="Open camera" disabled={starting}>
                    {starting ? "Starting…" : "Camera"}
                </Button>

                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => uploadRef.current?.click()}
                    aria-label="Open file picker"
                >
                    Upload
                </Button>

                <Button type="button" variant="secondary" onClick={copyBase64} disabled={!base64}>
                    Copy base64
                </Button>

                <Button type="button" variant="ghost" onClick={clearPhoto} disabled={!base64 && !dataUrl}>
                    Clear
                </Button>
            </div>

            {/* Base64 output */}
            <div className="space-y-1">
                <label className="text-sm text-muted-foreground">{label}</label>
                <Input value={base64} readOnly aria-label="Photo as base64"
                       className="font-mono text-xs overflow-x-auto"/>
            </div>

            {/* Preview + open full */}
            {dataUrl && (
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setViewerOpen(true)}
                        className="outline-none"
                        aria-label="Open full image"
                        title="Open full image"
                    >
                        <img src={dataUrl} alt="Captured preview"
                             className="h-24 w-24 rounded-md border object-cover cursor-zoom-in"/>
                    </button>
                    <span className="text-sm text-muted-foreground">Click preview to view full image</span>
                </div>
            )}

            {/* Live camera dialog */}
            <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
                <DialogContent className="sm:max-w-[96vw] p-0">
                    <DialogHeader className="px-4 pt-4">
                        <DialogTitle>Camera</DialogTitle>
                    </DialogHeader>

                    <div className="p-4 space-y-3">
                        {/* Camera picker */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Camera:</span>
                            <Select
                                value={selectedId ?? undefined}
                                onValueChange={(val) => setSelectedId(val)}
                                disabled={starting || !devices.length}
                            >
                                <SelectTrigger className="w-[260px]">
                                    <SelectValue placeholder={devices.length ? "Select camera" : "No cameras"}/>
                                </SelectTrigger>
                                <SelectContent>
                                    {devices.map((d, i) => (
                                        <SelectItem key={d.deviceId || `cam-${i}`} value={d.deviceId}>
                                            {d.label || `Camera ${i + 1}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <video
                            ref={videoRef}
                            playsInline
                            autoPlay
                            muted
                            className="w-full max-h-[64vh] object-contain rounded-md bg-black"
                        />

                        <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                                {cameraError ? `Error: ${cameraError}` : canSnap ? "Camera ready" : "Initializing…"}
                            </p>
                            <div className="flex gap-2">
                                <Button type="button" variant="ghost" onClick={() => setCameraOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="button" onClick={takePhoto} disabled={!canSnap}>
                                    Take photo
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Full image viewer */}
            <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
                <DialogContent className="sm:max-w-[96vw] p-0">
                    <DialogHeader className="px-4 pt-4">
                        <DialogTitle>Captured photo</DialogTitle>
                    </DialogHeader>
                    {dataUrl && (
                        <img src={dataUrl} alt="Full captured" className="w-full h-auto max-h-[90vh] object-contain"/>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
