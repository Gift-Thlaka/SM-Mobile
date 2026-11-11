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
        
        if (this.loginData.employeeID === '') {
            this.errorText.set('Enter your employee ID');
            return;
        };

        if (this.loginData.password === '') {
            this.errorText.set('Enter your password');
            return;
        }

        this.http.post(
            'http://localhost:8000/login', this.loginData
        ) .subscribe ({
            next: (success) => {
                this.errorText.set('');
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                this.errorText.set(error.error?.detail || 'Failed to login');
            }
        });

        
    }

}