import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginPageComponent } from './login-page.component';
import { CurrentUserService } from '../../../core/services/current-user.service';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  const navigateSpy = vi.fn();
  const loginWithCredentialsSpy = vi.fn();
  const getAvailableProfilesSpy = vi.fn();

  beforeEach(async () => {
    navigateSpy.mockReset();
    loginWithCredentialsSpy.mockReset();
    getAvailableProfilesSpy.mockReset();
    getAvailableProfilesSpy.mockReturnValue([
      {
        label: 'Directora',
        role: 'DIRECTOR',
        token: 'director-token',
        description: 'Acceso directivo completo de institución',
        email: 'director@taruca.cl',
        password: 'Taruca123!',
      },
      {
        label: 'UTP',
        role: 'UTP',
        token: 'utp-token',
        description: 'Gestión académica completa de institución',
        email: 'utp@taruca.cl',
        password: 'Taruca123!',
      },
    ]);

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        {
          provide: CurrentUserService,
          useValue: {
            getAvailableProfiles: getAvailableProfilesSpy,
            loginWithCredentials: loginWithCredentialsSpy,
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: navigateSpy,
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('fills form with clicked role profile', () => {
    component.fillWithProfile(component.profiles[1]);

    expect(component.form.getRawValue()).toEqual({
      email: 'utp@taruca.cl',
      password: 'Taruca123!',
    });
    expect(component.selectedProfile?.role).toBe('UTP');
  });

  it('submits credentials and navigates on successful login', () => {
    loginWithCredentialsSpy.mockReturnValue(true);
    component.form.setValue({
      email: 'director@taruca.cl',
      password: 'Taruca123!',
    });

    component.login();

    expect(loginWithCredentialsSpy).toHaveBeenCalledWith(
      'director@taruca.cl',
      'Taruca123!',
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/app/dashboard']);
  });
});
