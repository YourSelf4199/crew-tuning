import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { SpecificSettings } from '../../models/VehicleSpecificSettings/SpecificSettings';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-specific-settings',
  imports: [CommonModule, NgxSliderModule],
  templateUrl: './view-specific-settings.component.html',
  styleUrl: './view-specific-settings.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ViewSpecificSettingsComponent implements OnInit {
  @Input() settings!: SpecificSettings;

  settingEntries: [string, number][] = [];

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.settingEntries = Object.entries(this.settings).filter(
      ([_, value]) => typeof value === 'number',
    ) as [string, number][];

    this.cdRef.detectChanges();
  }

  sliderOptions: Options = {
    floor: -10,
    ceil: 10,
    step: 1,
    showSelectionBar: true,
  };
}
