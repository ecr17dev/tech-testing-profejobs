import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { ToastService } from '../../../core/services/toast.service';
import { GradebookApiService } from '../../gradebook/services/gradebook-api.service';
import { DataOverviewPageComponent } from './data-overview-page.component';

describe('DataOverviewPageComponent', () => {
  let component: DataOverviewPageComponent;
  let fixture: ComponentFixture<DataOverviewPageComponent>;

  const apiMock = {
    getSubjects: vi.fn(),
    getAcademicPeriods: vi.fn(),
    updateAcademicPeriodStatus: vi.fn(),
  };

  const currentUserMock = {
    canManageAcademicPeriods: vi.fn(),
  };
  const toastMock = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    confirm: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [DataOverviewPageComponent],
      providers: [
        { provide: GradebookApiService, useValue: apiMock },
        { provide: CurrentUserService, useValue: currentUserMock },
        { provide: ToastService, useValue: toastMock },
      ],
    }).compileComponents();
  });

  it('allows directors/utp to toggle period status from UI', async () => {
    currentUserMock.canManageAcademicPeriods.mockReturnValue(true);
    apiMock.getSubjects.mockReturnValue(
      of([
        {
          id: 'subject-1',
          name: 'Matemáticas',
          course: { id: 'course-1', name: '8vo A' },
          academicPeriod: {
            id: 'period-1',
            name: 'Primer Semestre',
            year: 2026,
            isOpen: true,
          },
        },
      ]),
    );
    apiMock.getAcademicPeriods.mockReturnValue(
      of([
        {
          id: 'period-1',
          name: 'Primer Semestre',
          year: 2026,
          isOpen: true,
        },
      ]),
    );
    apiMock.updateAcademicPeriodStatus.mockReturnValue(
      of({
        id: 'period-1',
        name: 'Primer Semestre',
        year: 2026,
        isOpen: false,
      }),
    );

    toastMock.confirm.mockResolvedValue(true);

    fixture = TestBed.createComponent(DataOverviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const toggleButton = fixture.nativeElement.querySelector(
      '.period-toggle',
    ) as HTMLButtonElement | null;

    expect(toggleButton).not.toBeNull();
    toggleButton?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(apiMock.updateAcademicPeriodStatus).toHaveBeenCalledWith(
      'period-1',
      false,
    );
    expect(component.periods[0]?.isOpen).toBe(false);
    expect(component.subjects[0]?.academicPeriod.isOpen).toBe(false);
    expect(toastMock.success).toHaveBeenCalledWith(
      'Período "Primer Semestre 2026" cerrado correctamente.',
    );
  });

  it('keeps period controls read-only for teacher role', () => {
    currentUserMock.canManageAcademicPeriods.mockReturnValue(false);
    apiMock.getSubjects.mockReturnValue(of([]));
    apiMock.getAcademicPeriods.mockReturnValue(
      of([
        {
          id: 'period-1',
          name: 'Primer Semestre',
          year: 2026,
          isOpen: true,
        },
      ]),
    );

    fixture = TestBed.createComponent(DataOverviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const toggleButton = fixture.nativeElement.querySelector('.period-toggle');
    const readonlyHint = fixture.nativeElement.textContent as string;

    expect(toggleButton).toBeNull();
    expect(readonlyHint).toContain('Solo Director(a) o UTP puede cambiar estado');
  });
});
