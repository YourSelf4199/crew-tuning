import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsTokenExpired } from './store/auth/auth.selectors';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(
    private store: Store,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.store.select(selectIsTokenExpired).subscribe((isExpired) => {
      if (isExpired) {
        this.authService.setIdToken();
      }
    });
  }
}
