import { Component,DestroyRef , computed, inject, signal} from '@angular/core';
import { takeUntilDestroyed,toSignal } from '@angular/core/rxjs-interop';
import { Router} from '@angular/router'
import { Auth } from '../../servicios/auth';
import { FormBuilder ,ReactiveFormsModule, Validators } from  '@angular/forms'
import { LoginRequest } from '../../modelos/auth';


@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})


export class Login {
  private authService = inject(Auth);  
  private router= inject(Router);
  private destroyRef = inject(DestroyRef)

  LoginForm= inject(FormBuilder).group({
    correo:['',[Validators.required,Validators.email]],
    contraseña:['',[Validators.required,Validators.minLength(6)]]



  });
  isLoading=signal(false);
  result=signal('');

  formStatus = toSignal(this.LoginForm.statusChanges,{initialValue:'INVALID' as const})
  canSubmit = computed(()=>this.formStatus()==='VALID'&& !this.isLoading());


  onSubmit(): void {
  if (!this.canSubmit()) return;
  this.isLoading.set(true);
  const credenciales = this.LoginForm.value as LoginRequest;

  this.authService.login(credenciales)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (respuesta) => {
        this.authService.guardarSesion(respuesta);
        this.result.set('Sesión iniciada correctamente');
        this.router.navigate(['/']);
      },

      error: () => {
        this.isLoading.set(false);
        this.result.set('Error al iniciar sesión. Verifica tus credenciales.');
      }
    });
}







}