import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, signal, effect, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatchService } from '../core/services/match.service';
import { AiDetectionService, DetectionResult } from '../core/services/ai-detection.service';
import { BaseComponent } from '../core/base/base.component';

@Component({
  selector: 'app-mapper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapper.component.html',
  styleUrl: './mapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapperComponent extends BaseComponent implements AfterViewInit, OnDestroy {
  private matchService = inject(MatchService);
  private aiService = inject(AiDetectionService);

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef<HTMLCanvasElement>;

  // Requirement #7 compliance
  isLoadingModel = toSignal(this.aiService.isLoading$, { initialValue: false });
  isModelReady = toSignal(this.aiService.isLoaded$, { initialValue: false });
  
  detections = signal<DetectionResult[]>([]);
  isAutoDetecting = signal(false);
  videoStatus = signal('Waiting for video...');
  
  private detectionInterval: any;

  constructor() {
    super(); // Requirement #8
    effect(() => {
      if (this.isModelReady()) {
        this.videoStatus.set('AI Model Ready. Load a video to start.');
      }
    });
  }

  ngAfterViewInit() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  override ngOnDestroy() {
    super.ngOnDestroy(); // Requirement #8
    this.stopAutoDetect();
    window.removeEventListener('resize', () => this.resizeCanvas());
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      this.loadVideo(url);
    }
  }

  loadDefaultVideo() {
    this.loadVideo('assets/Game (1).mp4');
  }

  private loadVideo(url: string) {
    const video = this.videoPlayer.nativeElement;
    video.src = url;
    video.load();
    this.videoStatus.set('Video loaded. Press Play.');
  }

  togglePlay() {
    const video = this.videoPlayer.nativeElement;
    if (video.paused) {
      video.play();
      if (this.isAutoDetecting()) this.startAutoDetect();
    } else {
      video.pause();
      this.stopAutoDetect();
    }
  }

  async loadModel() {
    this.isLoading.set(true);
    await this.aiService.loadModel();
    this.isLoading.set(false);
  }

  async detectFrame() {
    if (!this.isModelReady()) return;
    const results = await this.aiService.detect(this.videoPlayer.nativeElement);
    this.detections.set(results);
    this.drawDetections();
  }

  toggleAutoDetect() {
    this.isAutoDetecting.set(!this.isAutoDetecting());
    if (this.isAutoDetecting() && !this.videoPlayer.nativeElement.paused) {
      this.startAutoDetect();
    } else {
      this.stopAutoDetect();
    }
  }

  private startAutoDetect() {
    this.stopAutoDetect();
    this.detectionInterval = setInterval(() => this.detectFrame(), 100);
  }

  private stopAutoDetect() {
    if (this.detectionInterval) clearInterval(this.detectionInterval);
    this.detectionInterval = null;
  }

  private resizeCanvas() {
    const video = this.videoPlayer.nativeElement;
    const canvas = this.overlayCanvas.nativeElement;
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
  }

  private drawDetections() {
    const canvas = this.overlayCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const video = this.videoPlayer.nativeElement;
    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;

    this.detections().forEach(det => {
      const [x, y, w, h] = det.bbox;
      ctx.strokeStyle = det.class === 'sports ball' ? '#FFB414' : '#0f8f5b';
      ctx.lineWidth = 2;
      ctx.strokeRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);
      ctx.fillStyle = det.class === 'sports ball' ? '#FFB414' : '#0f8f5b';
      ctx.fillText(`${det.class} (${Math.round(det.score * 100)}%)`, x * scaleX, (y * scaleY) - 5);
    });
  }

  onCanvasClick(event: MouseEvent) {
    // Mapping logic
  }
}
