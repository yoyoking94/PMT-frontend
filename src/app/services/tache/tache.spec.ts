import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ProjectService, Projet } from '../projet/projet';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  const dummyProjet: Projet = {
    id: 1,
    nom: 'Projet Test',
    description: 'Description test',
    createurId: 1,
    dateDebut: '2025-10-23',
    priorite: 'moyenne',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectService],
    });

    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create project', () => {
    service.createProject({ nom: 'Nouveau Projet', createurId: 1 }).subscribe((projet) => {
      expect(projet).toEqual(dummyProjet);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/projects/create');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nom: 'Nouveau Projet', createurId: 1 });
    req.flush(dummyProjet);
  });

  it('should update project', () => {
    service.updateProject(1, dummyProjet, 1).subscribe((projet) => {
      expect(projet.nom).toBe(dummyProjet.nom);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/projects/update/1?userId=1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dummyProjet);
    req.flush(dummyProjet);
  });

  it('should delete project', () => {
    service.deleteProject(1, 1).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/projects/delete/1/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should get projects by user', () => {
    service.getMyProjects(1).subscribe((projects) => {
      expect(projects.length).toBe(1);
      expect(projects[0].id).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/projects/myprojects/1');
    expect(req.request.method).toBe('GET');
    req.flush([dummyProjet]);
  });

  it('should get all projects', () => {
    service.getAllProjects().subscribe((projects) => {
      expect(projects.length).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/projects/all');
    expect(req.request.method).toBe('GET');
    req.flush([dummyProjet]);
  });

  it('should get project by id', () => {
    service.getProjectById(1).subscribe((projet) => {
      expect(projet).toEqual(dummyProjet);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/projects/1');
    expect(req.request.method).toBe('GET');
    req.flush(dummyProjet);
  });
});
