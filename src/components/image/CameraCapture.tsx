// CameraCapture.tsx
import * as React from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";

type Props = {
    /** Prefer back ("environment") or front ("user") when auto-choosing. */
    facingMode?: "environment" | "user";
    label?: string;
};

export function CameraCapture({facingMode = "environment", label = "Base64"}: Props) {
    // Upload (always file picker)
    const uploadRef = React.useRef<HTMLInputElement | null>(null);

    // Live camera
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const streamRef = React.useRef<MediaStream | null>(null);

    // Devices
    const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    // UI state
    const [cameraOpen, setCameraOpen] = React.useState(false);
    const [startingCam, setStartingCam] = React.useState(false);
    const [cameraError, setCameraError] = React.useState<string | null>(null);
    const [canSnap, setCanSnap] = React.useState(false);

    // Photo state
    const [dataUrl, setDataUrl] = React.useState<string | null>(null);
    const [base64, setBase64] = React.useState<string>("");


    // ---------- Helpers ----------
    const toBase64 = (url: string) => {
        const i = url.indexOf(",");
        return i >= 0 ? url.slice(i + 1) : url;
    };
    const setFromDataUrl = (url: string) => {
        setDataUrl(url);
        setBase64(toBase64(url));
    };
    const stopStream = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setCanSnap(false);
        const v = videoRef.current;
        if (v) {
            v.srcObject = null;
        }
    };
    const pickPreferredDevice = (list: MediaDeviceInfo[]) => {
        if (!list.length) return null;
        const norm = (s: string) => s.toLowerCase();
        const back = list.find((d) => /back|rear|environment/i.test(d.label));
        const front = list.find((d) => /front|user|face/i.test(d.label));
        if (facingMode === "environment" && back) return back.deviceId;
        if (facingMode === "user" && front) return front.deviceId;
        // Prefer non-virtual camera if possible
        const nonVirtual = list.find((d) => !/virtual|obs|snap|mmhmm/i.test(norm(d.label)));
        return (nonVirtual ?? list[0]).deviceId;
    };

    // ---------- Enumerate devices (unlocks labels) ----------
    const enumerateCameras = React.useCallback(async () => {
        if (!navigator.mediaDevices?.enumerateDevices) return [];
        const list = await navigator.mediaDevices.enumerateDevices();
        return list.filter((d) => d.kind === "videoinput");
    }, []);

    // ---------- Start stream for a specific device ----------
    const startForDevice = React.useCallback(
        async (deviceId: string | null) => {
            if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera API not supported");
            setStartingCam(true);
            setCameraError(null);
            setCanSnap(false);
            try {
                const constraints: MediaStreamConstraints =
                    deviceId
                        ? {video: {deviceId: {exact: deviceId}}, audio: false}
                        : {video: {facingMode: {ideal: facingMode}}, audio: false};

                const s = await navigator.mediaDevices.getUserMedia(constraints);
                stopStream();
                streamRef.current = s;

                let video = videoRef.current;
                if (!video) {
                    await new Promise((r) => setTimeout(r, 0));
                    video = videoRef.current;
                }
                if (!video) {
                    setCameraError("Video element not mounted");
                    return;
                }
                video.srcObject = s;
                video.muted = true;
                video.playsInline = true;

                // Wait for frames
                await new Promise<void>((resolve) => {
                    const onLoaded = () => {
                        video.removeEventListener("loadeddata", onLoaded);
                        resolve();
                    };
                    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) resolve();
                    else video.addEventListener("loadeddata", onLoaded, {once: true});
                });

                await video.play().catch(() => {
                });
                // Give the decoder a tick; confirm frame dimensions are non-zero
                await new Promise((r) => setTimeout(r, 50));
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                    setCanSnap(true);
                } else {
                    // Some drivers need a nudge: toggle play/pause quickly
                    await video.pause();
                    await video.play().catch(() => {
                    });
                    setCanSnap(video.videoWidth > 0 && video.videoHeight > 0);
                }
            } catch (e) {
                stopStream();
                setCameraError(e instanceof Error ? e.message : "Failed to open camera");
                throw e;
            } finally {
                setStartingCam(false);
            }
        },
        [facingMode]
    );

    // ---------- Open camera flow ----------
    const openCamera = async () => {
        setCameraOpen(true);

        try {
            // 1) Prime permission by requesting a temporary stream to unlock labels (do not attach to video)
            try {
                if (navigator.mediaDevices?.getUserMedia) {
                    const tmp = await navigator.mediaDevices.getUserMedia({
                        video: {facingMode: {ideal: facingMode}},
                        audio: false
                    });
                    tmp.getTracks().forEach((t) => t.stop());
                }
            } catch {
                // Permission denied or no camera
            }

            // 2) Enumerate cameras with labels
            const vids = await enumerateCameras();
            setDevices(vids);

            // 3) Choose a device if none selected yet
            const nextId = selectedId ?? pickPreferredDevice(vids);
            if (nextId && nextId !== selectedId) {
                setSelectedId(nextId);
                // Stream will be (re)started by the effect watching selectedId
            }
        } catch {
            // handled in startForDevice
        }
    };

    // When dialog closes, release hardware
    React.useEffect(() => {
        if (!cameraOpen) stopStream();
        return () => stopStream();
    }, [cameraOpen]);

    // When user changes camera from dropdown, (re)start stream
    React.useEffect(() => {
        if (!cameraOpen) return;
        if (selectedId === null) return;
        startForDevice(selectedId).catch(() => {
        });
    }, [selectedId, cameraOpen, startForDevice]);

    // ---------- Take photo ----------
    const takePhoto = async () => {
        const video = videoRef.current;
        if (!video) return;
        if (!canSnap) return;

        const w = video.videoWidth || 1280;
        const h = video.videoHeight || 720;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, w, h);
        const url = canvas.toDataURL("image/jpeg", 0.92);
        setFromDataUrl(url);
        setCameraOpen(false); // will also stop stream
    };

    // ---------- Upload flow ----------
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
            // handle copy
        }
    };
    const clearPhoto = () => {
        setDataUrl(null);
        setBase64("");
        if (uploadRef.current) uploadRef.current.value = "";
    };

    return (
        <div className="space-y-3">
            {/* Hidden file input (Upload) */}
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
                <Button
                    type="button"
                    onClick={openCamera}
                    aria-label="Open camera"
                    disabled={startingCam}
                >
                    {startingCam ? "Starting…" : "Camera"}
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
                <button
                    type="button"
                    onClick={() => setCameraOpen(true)}
                    className="outline-none"
                    aria-label="Open full image"
                    title="Open full image"
                >
                    <img
                        src={dataUrl}
                        alt="Captured preview"
                        className="h-24 w-24 rounded-md border object-cover cursor-zoom-in"
                    />
                </button>
            )}

            {/* Camera / Viewer dialog */}
            <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
                <DialogContent className="sm:max-w-[95vw] p-0">
                    <DialogHeader className="px-4 pt-4">
                        <DialogTitle>{streamRef.current ? "Camera" : dataUrl ? "Captured photo" : "Camera"}</DialogTitle>
                    </DialogHeader>

                    {/* Always mount the video element so ref is available; hide when not streaming */}
                    <video
                        ref={videoRef}
                        playsInline
                        autoPlay
                        muted
                        className={`w-full max-h-[64vh] object-contain rounded-md bg-black ${streamRef.current ? "" : "hidden"}`}
                    />
                    {/* If streaming, show controls; else if we have a photo, show it large */}
                    {streamRef.current ? (
                        <div className="p-4 space-y-3">
                            {/* Camera picker */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Camera:</span>
                                <Select
                                    value={selectedId ?? undefined}
                                    onValueChange={(val) => setSelectedId(val)}
                                >
                                    <SelectTrigger className="w-[260px]">
                                        <SelectValue placeholder={devices.length ? "Select camera" : "No cameras"}/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {devices.map((d) => (
                                            <SelectItem key={d.deviceId} value={d.deviceId}>
                                                {d.label || `Camera ${d.deviceId.slice(0, 6)}…`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>


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
                    ) : dataUrl ? (
                        <img src={dataUrl} alt="Full captured" className="w-full h-auto max-h-[90vh] object-contain"/>
                    ) : (
                        <div className="p-4 text-sm text-muted-foreground">
                            {cameraError ?? "Waiting for camera…"}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
