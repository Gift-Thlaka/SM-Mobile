import { Component, input } from "@angular/core";

@Component ({
    selector: 'errorBar',
    standalone: true,
    templateUrl: './errorBar.html',
    styleUrls: ['./errorBar.css']
})

export class ErrorBar {

    errorText = input<string>('');

}