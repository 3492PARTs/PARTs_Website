import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { triggerChange } from '@app/core';
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

    @Input() ForegroundColor = '#ffffffff';

    @Input() BackgroundColor = '#000000ff';

    @Input() Title = '';

    @Input() TitlePosition: 'top' | 'bottom' = 'bottom';

    @Input() TitleMargin = 8;

    Value = '';
    Filename = 'qrcode.png';
    private pendingDownload = false;

    @ViewChild('qr', { read: ElementRef, static: true }) qrRef?: ElementRef<HTMLElement>;

    // Renders a QR code for the given value and downloads it as a PNG once rendering completes.
    download(value: string, filename: string): void {
        this.Filename = filename;
        this.pendingDownload = true;
        this.Value = value;
    }

    // Called by the underlying qrcode component once the canvas has finished rendering.
    onRendered(url: SafeUrl): void {
        triggerChange(() => {
            if (!this.pendingDownload) return;
            this.pendingDownload = false;

            const canvas = this.qrRef?.nativeElement.querySelector('canvas');
            if (!canvas) return;

            const downloadCanvas = this.createDownloadCanvas(canvas);
            downloadCanvas.toBlob(blob => {
                if (blob) saveAs(blob, this.Filename);
            }, 'image/png');
        }, 500);

    }

    private createDownloadCanvas(qrCanvas: HTMLCanvasElement): HTMLCanvasElement {
        const title = this.Title;
        if (!title) return qrCanvas;

        const titleFont = '16px Arial';
        const titleHeight = 20;
        const titleMargin = Number.isFinite(this.TitleMargin) ? Math.max(0, this.TitleMargin) : 0;
        const measureContext = qrCanvas.ownerDocument.createElement('canvas').getContext('2d');
        if (!measureContext) throw new Error('Unable to create a canvas context for the QR code title.');

        measureContext.font = titleFont;
        const titleWidth = Math.ceil(measureContext.measureText(title).width);
        const canvas = qrCanvas.ownerDocument.createElement('canvas');
        canvas.width = Math.max(qrCanvas.width, titleWidth);
        canvas.height = qrCanvas.height + titleHeight + titleMargin;

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Unable to create a canvas context for the titled QR code.');

        context.fillStyle = this.ForegroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = titleFont;
        context.fillStyle = this.BackgroundColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const titleY = this.TitlePosition === 'top' ? titleHeight / 2 : qrCanvas.height + titleHeight / 2;
        context.fillText(title, canvas.width / 2, titleY);

        const qrX = (canvas.width - qrCanvas.width) / 2;
        const qrY = this.TitlePosition === 'top' ? titleHeight + titleMargin : 0;
        context.drawImage(qrCanvas, qrX, qrY);

        return canvas;
    }
}
