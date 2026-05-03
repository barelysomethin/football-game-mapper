import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, signal, effect, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchService } from '../core/services/match.service';
import { AiDetectionService, DetectionResult } from '../core/services/ai-detection.service';

@Component({
  selector: 'app-mapper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapper.component.html',
  styleUrl: './mapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapperComponent implements AfterViewInit, OnDestroy {
  private matchService = inject(MatchService);
  private aiService = inject(AiDetectionService);

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef<HTMLCanvasElement>;

  // UI Signals
  isLoadingModel = this.aiService.isModelLoading;
  isModelReady = this.aiService.isModelLoaded;
  detections = signal<DetectionResult[]>([]);
  isAutoDetecting = signal(false);
  videoStatus = signal('Waiting for video...');
  
  private detectionInterval: any;

  constructor() {
    // Effect to handle model ready status
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

  ngOnDestroy() {
    this.stopAutoDetect();
    window.removeEventListener('resize', () => this.resizeCanvas());
  }

  // --- Video Handling ---

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

  // --- AI Detection ---

  async loadModel() {
    await this.aiService.loadModel();
  }

  async detectFrame() {
    if (!this.isModelReady()) return;
    
    const video = this.videoPlayer.nativeElement;
    const results = await this.aiService.detect(video);
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
    this.detectionInterval = setInterval(() => {
      this.detectFrame();
    }, 100); // 10 FPS for detection to keep it smooth but not heavy
  }

  private stopAutoDetect() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
  }

  // --- Drawing ---

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

    const currentDetections = this.detections();
    const video = this.videoPlayer.nativeElement;
    
    // Calculate scale if video is scaled in UI
    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;

    currentDetections.forEach(det => {
      const [x, y, w, h] = det.bbox;
      
      // Draw Bounding Box
      ctx.strokeStyle = det.class === 'sports ball' ? '#FFB414' : '#0f8f5b';
      ctx.lineWidth = 2;
      ctx.strokeRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);

      // Draw Label
      ctx.fillStyle = det.class === 'sports ball' ? '#FFB414' : '#0f8f5b';
      ctx.font = '12px Inter';
      const label = `${det.class} (${Math.round(det.score * 100)}%)`;
      ctx.fillText(label, x * scaleX, (y * scaleY) - 5);
    });
  }

  // --- Event Mapping ---

  onCanvasClick(event: MouseEvent) {
    const rect = this.overlayCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Translate to pitch coordinates (Logic to be refined)
    // For now, let's just log it
    console.log(`Clicked at: ${x}, ${y}`);
  }
}
