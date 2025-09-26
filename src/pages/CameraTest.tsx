import {CameraCapture} from "@/components/image/CameraCapture";

export default function CameraTest() {
    return (
        <div className="p-6">
            <CameraCapture facingMode="environment"/>
        </div>
    );
}
