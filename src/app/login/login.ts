import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { ErrorBar } from '../errorBar/errorBar';

interface logIns {
    employeeID: string,
    password: string
}



@Component ({
    selector: 'app-login',
    standalone: true,
    imports: [ErrorBar, FormsModule],
    templateUrl: './login.html',
    styleUrls: ['./login.css']
})

export class LoginScreen {

    constructor(private http: HttpClient, private router: Router) {}

    errorText = signal('');

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

        this.http.post<logIns>(
            'http://localhost:8000/mobile-login', this.loginData
        ).subscribe({
            next: (success: any) => {
                localStorage.setItem('E_id', success.E_id.toString());
                localStorage.setItem('S_id', success.S_id.toString());

                this.errorText.set('');
                this.router.navigate(['/notifications']);
            },
            error: (error) => {
                const detail = error.error?.detail;
                this.errorText.set(
                    typeof detail === 'string' ? detail : 'Failed to login'
                );
                console.log('LOGIN ERROR:', error.error);
            }
        });
    }

}