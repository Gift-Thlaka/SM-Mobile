import { Component, input } from '@angular/core';

@Component ({
    selector: 'app-loading',
    standalone: true,
    templateUrl: './loading.html',
    styleUrls: ['./loading.css']
})

export class LoadingBar {

    loading = input(false);

}