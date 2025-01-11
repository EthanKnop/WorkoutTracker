import { Component } from '@angular/core';
import { SettingsService } from './services/settings.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    public settingsService: SettingsService,
    public router: Router,
  ) {}

}