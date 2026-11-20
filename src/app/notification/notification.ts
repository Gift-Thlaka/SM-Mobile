import { Component, OnInit, signal } from "@angular/core";
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from "@angular/common/http";

import { ErrorBar } from "../errorBar/errorBar";

interface item {
    N_id: number,
    P_id: number,
    name: string,
    msg: string,
    price: string,
    quantity: string,
    barcode?: string,
    size?: string
}
interface itemQuantity  {
    quantity: string;
}

@Component ({
    selector: 'notification',
    standalone: true,
    imports: [ErrorBar, FormsModule],
    templateUrl: './notification.html',
    styleUrls: ['./notification.css']
})

export class Notification implements OnInit {

    constructor (private http: HttpClient, private router: Router) {}

    errorText = signal('');
    notificationList = signal<item[]>([]);

    ngOnInit() {
        this.getNotifications();
    }

    getNotifications(): void {
        const E_id = localStorage.getItem("E_id");

        this.http.get<item[]>(
            `http://localhost:8000/notifications/employee?E_id=${E_id}`
        ).subscribe({
            next: (success) => {
                this.errorText.set('');
                this.notificationList.set(success);
            },
            error: (error) => {
                const detail = error.error?.detail;
                this.errorText.set(
                    typeof detail === 'string' ? detail : 'Failed to get notifications'
                );
            }
        });
    }

    selectedTask = signal<item | null>(null);
    takeTask(N_id: number): void {
        const E_id = localStorage.getItem("E_id");

        this.http.post(
            'http://localhost:8000/notifications/take',
            { N_id: N_id, E_id: Number(E_id) }
        ).subscribe({
            next: () => {
                const selected = this.notificationList().find(
                    item => item.N_id === N_id
                );

                if (selected) {
                    this.selectedTask.set(selected);
                }

                this.errorText.set('');
                this.getNotifications();
                this.openTask();
            },
            error: (error) => {
                const detail = error.error?.detail;
                this.errorText.set(
                    typeof detail === 'string' ? detail : 'Failed to take task, try again.'
                );
                this.getNotifications();
            }
        });
    }

    task = signal(false);
    openTask(): void {
        this.task.set(true);
    }
    closeTask(): void {
        this.task.set(false);
    }
    QuantUpdate: itemQuantity = {
        quantity: ''
    }
    quantityTask(): void {
        if (this.QuantUpdate.quantity.trim() === '') {
            this.errorText.set('Please enter new quantity on the shelf.');
            return;
        }

        const E_id = localStorage.getItem('E_id');
        const selected = this.selectedTask();

        if (!E_id || !selected) {
            this.errorText.set('Employee or task not found.');
            return;
        }

        this.http.post(
            'http://localhost:8000/update-quantity',
            {
                E_id: Number(E_id),
                P_id: selected.P_id,
                quantity: Number(this.QuantUpdate.quantity)
            }
        ).subscribe({
            next: () => {
                this.errorText.set('');
                this.QuantUpdate.quantity = '';
                this.closeTask();
                this.selectedTask.set(null);
                this.getNotifications();
            },
            error: (error) => {
                this.errorText.set(
                    error.error?.detail || 'Failed to complete.'
                );
            }
        });
    }

    abandonTask(): void {
        this.closeTask();
        this.selectedTask.set(null);
        this.QuantUpdate.quantity = '';
        this.errorText.set('');
        this.getNotifications();
    }

    logout(): void {
        localStorage.removeItem('E_id');
        localStorage.removeItem('S_id');

        this.router.navigate(['/login']);
    }

}