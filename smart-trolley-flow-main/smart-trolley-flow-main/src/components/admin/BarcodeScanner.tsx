import { useEffect, useRef } from 'react';
import { Html5QrcodeSupportedFormats, Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
    onResult: (result: string) => void;
    onError?: (error: any) => void;
}

export function BarcodeScanner({ onResult, onError }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        let isComponentMounted = true;

        const formatsToSupport = [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.QR_CODE,
        ];

        // Need a slight delay to ensure the DOM is rendered before scanner attaches
        const timer = setTimeout(() => {
            if (!isComponentMounted) return;

            const html5Qrcode = new Html5Qrcode("reader", {
                formatsToSupport,
                experimentalFeatures: { useBarCodeDetectorIfSupported: true },
                verbose: false
            });
            scannerRef.current = html5Qrcode;

            html5Qrcode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 320, height: 200 },
                    aspectRatio: 4 / 3,
                },
                (decodedText) => {
                    if (isComponentMounted) {
                        onResult(decodedText.trim());
                    }
                },
                (errorMessage) => {
                    // Ignore background scanning errors
                }
            ).catch(err => {
                console.error("Failed to start scanner:", err);
                if (onError && isComponentMounted) {
                    onError(err);
                }
            });
        }, 300);

        // Cleanup when component unmounts
        return () => {
            isComponentMounted = false;
            clearTimeout(timer);
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error).finally(() => {
                    scannerRef.current?.clear();
                });
            }
        };
    }, [onResult, onError]);

    return (
        <div className="w-full">
            <div id="reader" className="w-full mx-auto overflow-hidden rounded-lg border bg-background"></div>
        </div>
    );
}
