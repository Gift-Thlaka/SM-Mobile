import { Component, OnInit, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { ErrorBar } from "../errorBar/errorBar";

interface item {
    id: number,
    name: string,
    instruction: string
}

@Component ({
    selector: 'notification',
    standalone: true,
    imports: [ErrorBar],
    templateUrl: './notification.html',
    styleUrls: ['./notification.css']
})

export class Notification implements OnInit {

    constructor (private http: HttpClient) {}

    ngOnInit() {
        this.getNotifications();
    }

    errorText = signal('');
    
    notificationList = signal<item[]>([]);

    getNotifications(): void {
        this.http.get<item[]> (
            'http://localhost:8000/notifications'
        ).subscribe ({
            next: (success) => {
                this.errorText.set('');

                this.notificationList.set(success);
            },
            error: (error) => {
                this.errorText.set(error.error?.detail || 'Failed to get notifications');
            }
        });
    }

    updated(itemId: number): void {
        
        this.http.post(
            `http://localhost:8000/delete-notification?item_id=${itemId}`, {}
        ).subscribe ({
            next: (success) => {
                this.errorText.set('');
                this.getNotifications()
            }, 
            error: (error) => {
                this.errorText.set(error.error?.detail || 'Failed to update inventory, try again.')
            }
        });
    }

}