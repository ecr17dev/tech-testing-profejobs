import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { authTokenInterceptor } from './auth-token.interceptor';
import { CurrentUserService } from '../services/current-user.service';

describe('authTokenInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        {
          provide: CurrentUserService,
          useValue: {
            getAuthToken: () => 'teacher-token',
          },
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('adds bearer token header to outgoing requests', () => {
    httpClient.get('/api/subjects').subscribe();

    const req = httpMock.expectOne('/api/subjects');
    expect(req.request.headers.get('Authorization')).toBe(
      'Bearer teacher-token',
    );
    req.flush([]);
  });
});
