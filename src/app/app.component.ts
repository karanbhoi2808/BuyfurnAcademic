import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './Component/loading/loading.component';
import { NetworkStatusService } from './Service/network-status.service';
import { NoInternetComponent } from './Component/no-internet/no-internet.component';


@Component({
    selector: 'app-root',
    imports: [RouterOutlet, LoadingComponent, NoInternetComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  private networkStatusService = inject(NetworkStatusService);

  title = 'FrontEnd';

  isOnline = true;

  ngOnInit() {
    this.networkStatusService.isOnline.subscribe(status => {
      this.isOnline = status;
    });
  }
}
