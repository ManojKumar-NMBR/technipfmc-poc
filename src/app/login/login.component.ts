import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {

    credential = {user:'', pass:''};
    name;
    constructor(
      public router: Router
    ) {}

    ngOnInit() {
        let credential =JSON.parse(localStorage.getItem('credential'));
        if (credential && credential.user == "admin" && credential.pass == "admin") {
            this.router.navigate(['/home']);
        }
    }

    onLoggedin() {
        localStorage.setItem('credential', JSON.stringify(this.credential));
        this.router.navigateByUrl('/home');
    }
}
