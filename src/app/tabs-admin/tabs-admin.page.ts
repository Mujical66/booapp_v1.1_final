import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { create, person, trash } from 'ionicons/icons'; 

@Component({
  selector: 'app-tabs-admin',
  templateUrl: 'tabs-admin.page.html',
  styleUrls: ['tabs-admin.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsAdminPage {
  constructor() {
    addIcons({ create, person, trash });
  }
}