
import { Component, OnInit, OnDestroy, signal } from "@angular/core";
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from "@angular/common/http";

import { App } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import { interval, Subscription } from 'rxjs';

import { ErrorBar } from "../errorBar/errorBar";
import { LoadingBar } from '../loading/loading';

interface item {
    N_id: number,
    P_id: number,
    name: string,
    msg: string,
    price: string,
    quantity: string,
    task_type: 'STOCK' | 'PRICE',
    barcode?: string,
    size?: string
}

interface itemQuantity {
    quantity: number | string;
}

@Component ({
    selector: 'notification',
    standalone: true,
    imports: [ErrorBar, FormsModule, LoadingBar],
    templateUrl: './notification.html',
    styleUrls: ['./notification.css']
})

export class Notification implements OnInit, OnDestroy {

    constructor (private http: HttpClient, private router: Router) {}

    errorText = signal('');
    loading = signal(false);
    notificationList = signal<item[]>([]);

    // Automatic notification refreshing
    private polling?: Subscription;
    private appListener?: PluginListenerHandle;
    private isFetching = false;

    async ngOnInit() {
        this.getNotifications();

        this.startPolling();

        this.appListener = await App.addListener('appStateChange', (state) => {

            if (state.isActive) {
                // Refresh immediately when user returns
                this.getNotifications(false);

                // Resume 5-second polling
                this.startPolling();

            } else {
                // Stop polling when app goes to background
                this.stopPolling();
            }

        });
    }

    ngOnDestroy() {
        this.stopPolling();

        if (this.appListener) {
            this.appListener.remove();
        }
    }

    startPolling(): void {
        // Prevent duplicate polling subscriptions
        this.stopPolling();

        this.polling = interval(5000).subscribe(() => {
            this.getNotifications(false);
        });
    }

    stopPolling(): void {
        this.polling?.unsubscribe();
        this.polling = undefined;
    }

    getNotifications(showLoading: boolean = true): void {
        const E_id = localStorage.getItem("E_id");

        if (!E_id || this.isFetching) {
            return;
        }

        this.isFetching = true;

        if (showLoading) {
            this.loading.set(true);
        }

        this.http.get<item[]>(
            `https://sm-api-n27i.onrender.com/notifications/employee?E_id=${E_id}`
        ).subscribe({
            next: (success) => {
                this.errorText.set('');
                this.notificationList.set(success);
                this.isFetching = false;

                if (showLoading) {
                    this.loading.set(false);
                }
            },
            error: (error) => {
                if (showLoading) {
                    const detail = error.error?.detail;

                    this.errorText.set(
                        typeof detail === 'string' ? detail : 'Failed to get notifications'
                    );

                    this.loading.set(false);
                }

                this.isFetching = false;
            }
        });
    }

    selectedTask = signal<item | null>(null);

    takeTask(N_id: number): void {
        const E_id = localStorage.getItem("E_id");

        this.loading.set(true);

        this.http.post(
            'https://sm-api-n27i.onrender.com/notifications/take',
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
                this.loading.set(false);
            },
            error: (error) => {
                const detail = error.error?.detail;

                this.errorText.set(
                    typeof detail === 'string' ? detail : 'Failed to take task, try again.'
                );
                this.getNotifications();
                this.loading.set(false);
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
        if (this.QuantUpdate.quantity === null || this.QuantUpdate.quantity === undefined || this.QuantUpdate.quantity.toString().trim() === '') {
            this.errorText.set('Please enter new quantity on the shelf.');
            return;
        }

        const E_id = localStorage.getItem('E_id');
        const selected = this.selectedTask();

        if (!E_id || !selected) {
            this.errorText.set('Employee or task not found.');
            return;
        }

        this.loading.set(true);

        this.http.post(
            'https://sm-api-n27i.onrender.com/update-quantity',
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
                this.loading.set(false);
            },
            error: (error) => {
                this.errorText.set(
                    error.error?.detail || 'Failed to complete.'
                );
                this.loading.set(false);
            }
        });
    }

    completePriceTask(): void {
        const E_id = localStorage.getItem('E_id');
        const selected = this.selectedTask();

        if (!E_id || !selected) {
            this.errorText.set('Employee or task not found.');
            return;
        }

        this.loading.set(true);

        this.http.post(
            'https://sm-api-n27i.onrender.com/complete-price-task',
            {
                N_id: selected.N_id,
                E_id: Number(E_id)
            }
        ).subscribe({
            next: () => {
                this.errorText.set('');
                this.closeTask();
                this.selectedTask.set(null);
                this.getNotifications();
                this.loading.set(false);
            },
            error: (error) => {
                this.errorText.set(
                    error.error?.detail || 'Failed to complete price task.'
                );
                this.loading.set(false);
            }
        });
    }

    abandonTask(): void {
        const E_id = localStorage.getItem('E_id');
        const selected = this.selectedTask();

        if (!E_id || !selected) {
            this.errorText.set('Employee or task not found.');
            return;
        }

        this.loading.set(true);

        this.http.post(
            'https://sm-api-n27i.onrender.com/notifications/abandon',
            {
                N_id: selected.N_id,
                E_id: Number(E_id)
            }
        ).subscribe({
            next: () => {
                this.closeTask();
                this.selectedTask.set(null);
                this.QuantUpdate.quantity = '';
                this.errorText.set('');
                this.getNotifications();
                this.loading.set(false);
            },
            error: (error) => {
                this.errorText.set(
                    error.error?.detail || 'Failed to abandon task.'
                );
                this.loading.set(false);
            }
        });
    }

    logout(): void {
        localStorage.removeItem('E_id');
        localStorage.removeItem('S_id');

        this.router.navigate(['/login']);
    }

}
