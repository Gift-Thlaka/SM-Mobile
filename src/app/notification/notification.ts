import { Component, OnInit, signal } from "@angular/core";

import { ErrorBar } from "../errorBar/errorBar";

@Component ({
    selector: 'notification',
    standalone: true,
    imports: [ErrorBar],
    templateUrl: './notification.html',
    styleUrls: ['./notification.css']
})

export class Notification implements OnInit {

    ngOnInit() {

    }

    errorText = signal('');

    updated(): void {
        this.errorText.set('updated');
    }

}