import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-button.component.html',
})
export class LoadingButtonComponent {
  @Input() isLoading: boolean | null = false;
  @Input() loadingText = '';
}
