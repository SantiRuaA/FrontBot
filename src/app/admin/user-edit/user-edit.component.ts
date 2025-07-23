import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserState } from '../../state/user/user.state';
import { UpdateUser } from '../../state/user/user.actions';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-edit.component.html',
})
export class UserEditComponent implements OnInit {
  userId!: string;
  editForm!: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private fb: FormBuilder,
    private store: Store
  ) {
    this.loading$ = this.store.select(UserState.loading);
    this.error$ = this.store.select(UserState.error);
  }

  ngOnInit(): void {
    this.editForm = this.fb.group({
        tipo_de_identificacion: ['C.C.', Validators.required],
        numero_identificacion: ['', Validators.required],
        primer_nombre: ['', Validators.required],
        segundo_nombre: [''],
        primer_apellido: ['', Validators.required],
        segundo_apellido: [''],
        fecha_nacimiento: ['', Validators.required],
        pais_residencia: ['', Validators.required],
        dpto_residencia: ['', Validators.required],
        mncpio_residencia: ['', Validators.required],
        direccion_residencia: ['', Validators.required],
        correo_sena: ['', [Validators.required, Validators.email]],
        correo_particular: ['', [Validators.email]],
        telefono_entidad: [''],
        extension_telefonica: [''],
        numero_celular: ['', Validators.required],
        estado_actual: [true, Validators.required],
        fecha_inicio_contrato: ['', Validators.required],
        fecha_fin_contrato: ['', Validators.required],
        numero_contrato: [''],
        rol_asignado: ['Instructor', Validators.required],
    });

    this.userId = this.route.snapshot.paramMap.get('id')!;

    if (this.userId) {
      this.userService.getUserById(this.userId).pipe(
        tap(userData => {
          this.editForm.patchValue({
            ...userData,
            numero_identificacion: userData.tenantId,
            fecha_nacimiento: this.formatDate(userData.fecha_nacimiento),
            fecha_inicio_contrato: this.formatDate(userData.fecha_inicio_contrato),
            fecha_fin_contrato: this.formatDate(userData.fecha_fin_contrato),
          });
        })
      ).subscribe();
    }
  }

  private formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return [d.getFullYear(), month, day].join('-');
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      return;
    }

    const formValue = this.editForm.value;
    const payload = {
      tenantId: parseInt(formValue.numero_identificacion, 10),
      tipo_de_identificacion: formValue.tipo_de_identificacion,
      primer_nombre: formValue.primer_nombre,
      segundo_nombre: formValue.segundo_nombre,
      primer_apellido: formValue.primer_apellido,
      segundo_apellido: formValue.segundo_apellido,
      fecha_nacimiento: formValue.fecha_nacimiento,
      pais_residencia: formValue.pais_residencia,
      dpto_residencia: formValue.dpto_residencia,
      mncpio_residencia: formValue.mncpio_residencia,
      direccion_residencia: formValue.direccion_residencia,
      correo_sena: formValue.correo_sena,
      correo_particular: formValue.correo_particular,
      telefono_entidad: formValue.telefono_entidad,
      extension_telefonica: formValue.extension_telefonica,
      numero_celular: formValue.numero_celular,
      estado_actual: formValue.estado_actual,
      fecha_inicio_contrato: formValue.fecha_inicio_contrato,
      fecha_fin_contrato: formValue.fecha_fin_contrato,
      numero_contrato: formValue.numero_contrato,
      rol_asignado: formValue.rol_asignado
    };

    this.store.dispatch(new UpdateUser(this.userId, payload));
  }
}