import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-mapper',
  standalone: true,
  templateUrl: './mapper.component.html',
  styleUrl: './mapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapperComponent {}
