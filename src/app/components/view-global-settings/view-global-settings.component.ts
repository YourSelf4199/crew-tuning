import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { GlobalSettings } from '../../models/VehicleGlobalSettings/GlobalSettings';
import { CommonModule } from '@angular/common';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';

@Component({
  selector: 'app-view-global-settings',
  imports: [CommonModule, NgxSliderModule],
  templateUrl: './view-global-settings.component.html',
  styleUrl: './view-global-settings.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ViewGlobalSettingsComponent implements OnInit {
  @Input() settings!: GlobalSettings;
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
