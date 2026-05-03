import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export interface DetectionResult {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

@Injectable({
  providedIn: 'root'
})
export class AiDetectionService {
  private model: cocoSsd.ObjectDetection | null = null;
  
  // 1. Private state using BehaviorSubjects
  private readonly _isLoading = new BehaviorSubject<boolean>(false);
  private readonly _isLoaded = new BehaviorSubject<boolean>(false);

  // 2. Public Observables (Strict Requirement #7)
  readonly isLoading$ = this._isLoading.asObservable();
  readonly isLoaded$ = this._isLoaded.asObservable();

  async loadModel(): Promise<void> {
    if (this.model || this._isLoading.value) return;

    this._isLoading.next(true);

    try {
      await tf.ready();
      this.model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
      this._isLoaded.next(true);
    } catch (err) {
      console.error('AI model load failed', err);
    } finally {
      this._isLoading.next(false);
    }
  }

  async detect(element: any): Promise<DetectionResult[]> {
    if (!this.model) throw new Error('AI Model not loaded');
    const predictions = await this.model.detect(element);
    return predictions
      .filter(p => p.class === 'person' || p.class === 'sports ball')
      .map(p => ({
        bbox: p.bbox as [number, number, number, number],
        class: p.class,
        score: p.score
      }));
  }
}
