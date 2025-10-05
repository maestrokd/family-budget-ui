type CameraPermissionState = {
    granted: boolean;
    stream: MediaStream | null;
};

const state: CameraPermissionState = {
    granted: false,
    stream: null
};

const replaceCachedStream = (stream: MediaStream | null) => {
    if (state.stream && state.stream !== stream) {
        state.stream.getTracks().forEach((track) => track.stop());
    }
    state.stream = stream;
};

export function hasCameraPermissionGranted(): boolean {
    return state.granted;
}

export function setCameraPermissionGranted(stream?: MediaStream | null) {
    state.granted = true;
    if (stream !== undefined) {
        replaceCachedStream(stream);
    }
}

export function resetCameraPermission() {
    state.granted = false;
    if (state.stream) {
        replaceCachedStream(null);
    }
}

export function consumeCachedCameraStream(): MediaStream | null {
    const stream = state.stream;
    state.stream = null;
    return stream;
}
