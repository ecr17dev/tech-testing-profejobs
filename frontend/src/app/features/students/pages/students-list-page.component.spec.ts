import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { ToastService } from '../../../core/services/toast.service';
import { XlsxExportService } from '../../../shared/services/xlsx-export.service';
import { StudentsApiService } from '../services/students-api.service';
import { StudentsListPageComponent } from './students-list-page.component';

describe('StudentsListPageComponent', () => {
  let component: StudentsListPageComponent;
  let fixture: ComponentFixture<StudentsListPageComponent>;

  const apiMock = {
    getStudents: vi.fn(),
    createStudent: vi.fn(),
    updateStudent: vi.fn(),
    deleteStudent: vi.fn(),
    reactivateStudent: vi.fn(),
  };
  const currentUserMock = {
    canManageStudents: vi.fn(() => true),
  };
  const toastMock = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    confirm: vi.fn(),
  };
  const xlsxExportMock = {
    exportRowsToXlsx: vi.fn(),
    getCurrentDateStamp: vi.fn(() => '2026-06-01'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    apiMock.getStudents.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [StudentsListPageComponent],
      providers: [
        provideRouter([]),
        { provide: StudentsApiService, useValue: apiMock },
        { provide: CurrentUserService, useValue: currentUserMock },
        { provide: ToastService, useValue: toastMock },
        { provide: XlsxExportService, useValue: xlsxExportMock },
      ],
    }).compileComponents();
  });

  it('filters students by text (name, lastname, rut)', () => {
    fixture = TestBed.createComponent(StudentsListPageComponent);
    component = fixture.componentInstance;
    component.students = [
      {
        id: 's-1',
        institutionId: 'inst-1',
        firstName: 'Emilia',
        lastName: 'Araya',
        rut: '11.111.111-1',
        isActive: true,
      },
      {
        id: 's-2',
        institutionId: 'inst-1',
        firstName: 'Diego',
        lastName: 'Campos',
        rut: '22.222.222-2',
        isActive: true,
      },
    ];
    component.statusFilter = 'all';
    component.studentSearchTerm = '22.222';

    expect(component.filteredStudents.map((student) => student.id)).toEqual(['s-2']);
  });

  it('filters students by status', () => {
    fixture = TestBed.createComponent(StudentsListPageComponent);
    component = fixture.componentInstance;
    component.students = [
      {
        id: 's-1',
        institutionId: 'inst-1',
        firstName: 'Emilia',
        lastName: 'Araya',
        rut: null,
        isActive: true,
      },
      {
        id: 's-2',
        institutionId: 'inst-1',
        firstName: 'Diego',
        lastName: 'Campos',
        rut: null,
        isActive: false,
      },
    ];
    component.statusFilter = 'inactive';

    expect(component.filteredStudents.map((student) => student.id)).toEqual(['s-2']);
  });

  it('exports only visible rows', () => {
    fixture = TestBed.createComponent(StudentsListPageComponent);
    component = fixture.componentInstance;
    component.students = [
      {
        id: 's-1',
        institutionId: 'inst-1',
        firstName: 'Emilia',
        lastName: 'Araya',
        rut: '11.111.111-1',
        isActive: true,
      },
      {
        id: 's-2',
        institutionId: 'inst-1',
        firstName: 'Diego',
        lastName: 'Campos',
        rut: '22.222.222-2',
        isActive: false,
      },
    ];
    component.statusFilter = 'inactive';

    component.downloadVisibleStudents();

    expect(xlsxExportMock.exportRowsToXlsx).toHaveBeenCalledTimes(1);
    expect(xlsxExportMock.exportRowsToXlsx).toHaveBeenCalledWith(
      'taruca-alumnos-2026-06-01.xlsx',
      'Alumnos',
      [
        {
          Nombre: 'Diego',
          Apellido: 'Campos',
          RUT: '22.222.222-2',
          Estado: 'Inactivo',
        },
      ],
    );
  });

  it('does not export when there are no visible rows', () => {
    fixture = TestBed.createComponent(StudentsListPageComponent);
    component = fixture.componentInstance;
    component.students = [
      {
        id: 's-1',
        institutionId: 'inst-1',
        firstName: 'Emilia',
        lastName: 'Araya',
        rut: null,
        isActive: true,
      },
    ];
    component.statusFilter = 'inactive';

    component.downloadVisibleStudents();

    expect(xlsxExportMock.exportRowsToXlsx).not.toHaveBeenCalled();
    expect(toastMock.info).toHaveBeenCalledWith('No hay alumnos visibles para exportar.');
  });
});
