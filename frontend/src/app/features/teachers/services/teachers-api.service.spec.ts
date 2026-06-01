import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TeachersApiService } from './teachers-api.service';

describe('TeachersApiService', () => {
  let service: TeachersApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TeachersApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests GET /teachers when listing teachers', () => {
    service.getTeachers().subscribe();

    const req = httpMock.expectOne('/api/teachers');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('sends POST /teachers when creating teacher', () => {
    service
      .createTeacher({
        fullName: 'Camila Rojas',
        email: 'camila@taruca.cl',
      })
      .subscribe();

    const req = httpMock.expectOne('/api/teachers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      fullName: 'Camila Rojas',
      email: 'camila@taruca.cl',
    });
    req.flush({
      id: 'teacher-1',
      institutionId: 'inst-1',
      fullName: 'Camila Rojas',
      email: 'camila@taruca.cl',
      role: 'TEACHER',
    });
  });

  it('sends DELETE /teachers/:id when deleting teacher', () => {
    service.deleteTeacher('teacher-1').subscribe();

    const req = httpMock.expectOne('/api/teachers/teacher-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
