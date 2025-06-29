import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, map, create, person, share } from 'ionicons/icons'; 

@Component({
  selector: 'app-tabs-user',
  templateUrl: 'tabs-user.page.html',
  styleUrls: ['tabs-user.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsUserPage {
  constructor() {
    addIcons({ home, map, create, person, share });
  }
}