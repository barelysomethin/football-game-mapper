import { Injectable, signal } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export interface DetectionResult {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: string;
  score: number;
}

@Injectable({
  providedIn: 'root'
})
export class AiDetectionService {
  private model: cocoSsd.ObjectDetection | null = null;
  
  readonly isModelLoading = signal(false);
  readonly isModelLoaded = signal(false);
  readonly loadError = signal<string | null>(null);

  constructor() {
    // We don't load the model automatically to save resources
    // The user will trigger it from the UI
  }

  async loadModel(): Promise<void> {
    if (this.model || this.isModelLoading()) return;

    this.isModelLoading.set(true);
    this.loadError.set(null);

    try {
      // Ensure TFJS is ready
      await tf.ready();
      
      // Load the COCO-SSD model
      this.model = await cocoSsd.load({
        base: 'lite_mobilenet_v2' // Using lite version for better browser performance
      });
      
      this.isModelLoaded.set(true);
    } catch (err) {
      console.error('Failed to load AI model:', err);
      this.loadError.set('Failed to load AI model. Please check your internet connection.');
    } finally {
      this.isModelLoading.set(false);
    }
  }

  async detect(element: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Promise<DetectionResult[]> {
    if (!this.model) {
      throw new Error('AI Model not loaded');
    }

    const predictions = await this.model.detect(element);
    
    // We only care about people and sports balls for this app
    return predictions
      .filter(p => p.class === 'person' || p.class === 'sports ball')
      .map(p => ({
        bbox: p.bbox as [number, number, number, number],
        class: p.class,
        score: p.score
      }));
  }
}
