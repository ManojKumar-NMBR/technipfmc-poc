import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router) {}

    canActivate() {
        let credential =JSON.parse(localStorage.getItem('credential'));
        if (credential && credential.user == "admin" && credential.pass == "admin") {
            return true;
        }

        this.router.navigate(['/login']);
        return false;
    }
}
