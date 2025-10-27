import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService, Projet } from './projet';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  const dummyProject: Projet = {
    id: 1,
    nom: 'Projet Test',
    createurId: 1,
    description: 'Description du projet',
    dateDebut: '2025-01-01',
    priorite: 'moyenne',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        ProjectService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create a project', () => {
    service.createProject({ nom: 'Projet Test', createurId: 1 }).subscribe((res) => {
      expect(res).toEqual(dummyProject);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/projects/create');
    expect(req.request.method).toBe('POST');
    req.flush(dummyProject);
  });

  it('should update a project', () => {
    const updated = { ...dummyProject, nom: 'Projet Modifié' };

    service.updateProject(1, updated, 1).subscribe((res) => {
      expect(res.nom).toBe('Projet Modifié');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/projects/update/1?userId=1');
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  it('should delete a project', () => {
    service.deleteProject(1, 1).subscribe((res) => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/projects/delete/1/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should fetch all projects', () => {
    const projects = [dummyProject];

    service.getAllProjects().subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res).toEqual(projects);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/projects/all');
    expect(req.request.method).toBe('GET');
    req.flush(projects);
  });

  it('should fetch project by ID', () => {
    service.getProjectById(1).subscribe((res) => {
      expect(res).toEqual(dummyProject);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/projects/1');
    expect(req.request.method).toBe('GET');
    req.flush(dummyProject);
  });

  it('should fetch my projects', () => {
    const projects = [dummyProject];

    service.getMyProjects(1).subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].id).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/projects/myprojects/1');
    expect(req.request.method).toBe('GET');
    req.flush(projects);
  });
});
