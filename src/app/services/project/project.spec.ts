import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService, Project } from './project';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/projects';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService],
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch projects', () => {
    const dummyProjects: Project[] = [
      { id: 1, name: 'Projet A', startDate: '2025-01-01', createBy: 1 },
      { id: 2, name: 'Projet B', startDate: '2025-02-01', createBy: 2 },
    ];

    service.getProjects().subscribe((projects) => {
      expect(projects.length).toBe(2);
      expect(projects).toEqual(dummyProjects);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(dummyProjects);
  });

  it('should create a project', () => {
    const newProject: Project = { name: 'Nouveau Projet', startDate: '2025-08-01', createBy: 1 };

    service.createProject(newProject).subscribe((project) => {
      expect(project).toEqual({ ...newProject, id: 3 });
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ ...newProject, id: 3 });
  });

  it('should update a project', () => {
    const updatedProject: Project = {
      id: 1,
      name: 'Projet Mis à Jour',
      startDate: '2025-01-01',
      createBy: 1,
    };

    service.updateProject(1, updatedProject).subscribe((project) => {
      expect(project).toEqual(updatedProject);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedProject);
  });

  it('should delete a project', () => {
    service.deleteProject(1, 1).subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/1?userId=1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});
