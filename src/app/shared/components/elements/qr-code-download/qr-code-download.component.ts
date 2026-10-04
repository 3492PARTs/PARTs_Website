import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { QRCodeComponent } from 'angularx-qrcode';
import { saveAs } from 'file-saver';

// Renders a hidden QR code canvas on demand and downloads it as a PNG file.
@Component({
    selector: 'app-qr-code-download',
    imports: [QRCodeComponent],
    templateUrl: './qr-code-download.component.html',
    styleUrls: ['./qr-code-download.component.scss']
})
export class QrCodeDownloadComponent {

    @Input() Width = 256;

    Value = '';
    Filename = 'qrcode.png';
    private pendingDownload = false;
    public qrCodeDownloadLink: SafeUrl = "";

    @ViewChild('qr', { read: ElementRef, static: true }) qrRef?: ElementRef<HTMLElement>;

    // Renders a QR code for the given value and downloads it as a PNG once rendering completes.
    download(value: string, filename: string): void {
        this.Filename = filename;
        this.pendingDownload = true;
        this.Value = value;
    }

    // Called by the underlying qrcode component once the canvas has finished rendering.
    onRendered(url: SafeUrl): void {
        if (!this.pendingDownload) return;
        this.pendingDownload = false;
        this.qrCodeDownloadLink = url;

        const canvas = this.qrRef?.nativeElement.querySelector('canvas');
        if (!canvas) return;

        canvas.toBlob(blob => {
            if (blob) saveAs(blob, this.Filename);
        }, 'image/png');
    }
}
