
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {

    const router = inject(Router);

    const M_id = localStorage.getItem('E_id');

    if (M_id) {
        return true;
    }

    router.navigate(['/login']);
    return false;

};
