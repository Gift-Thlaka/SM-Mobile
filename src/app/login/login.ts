import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { ErrorBar } from '../errorBar/errorBar';
import { LoadingBar } from '../loading/loading';

interface logIns {
    employeeID: string,
    password: string
}



@Component ({
    selector: 'app-login',
    standalone: true,
    imports: [ErrorBar, FormsModule, LoadingBar],
    templateUrl: './login.html',
    styleUrls: ['./login.css']
})

export class LoginScreen {

    constructor(private http: HttpClient, private router: Router) {}

    errorText = signal('');
    loading = signal(false);

    loginData: logIns = {
        employeeID: '',
        password: ''
    };

    login(): void {
        if (this.loginData.employeeID.trim() === '') {
            this.errorText.set('Enter your employee ID');
            return;
        }

        if (this.loginData.password === '') {
            this.errorText.set('Enter your password');
            return;
        }

        this.loading.set(true);

        this.http.post<logIns>(
            'https://sm-api-n27i.onrender.com/mobile-login', this.loginData
        ).subscribe({
            next: (success: any) => {
                localStorage.setItem('E_id', success.E_id.toString());
                localStorage.setItem('S_id', success.S_id.toString());

                this.errorText.set('');
                this.router.navigate(['/notifications']);
                this.loading.set(false);
            },
            error: (error) => {
                const detail = error.error?.detail;
                this.errorText.set(
                    typeof detail === 'string' ? detail : 'Failed to login'
                );
                this.loading.set(false);
            }
        });
    }

}