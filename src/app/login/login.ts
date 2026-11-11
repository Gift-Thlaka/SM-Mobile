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
        this.errorText.set('loggged in');

        this.router.navigate(['/dashboard']);
    }

}