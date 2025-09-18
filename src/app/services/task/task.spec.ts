import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TaskService, Task } from './task';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const mockTask: Task = {
    id: 1,
    name: 'Tâche Test',
    description: 'Description test',
    dueDate: '2025-09-18T00:00:00Z',
    priority: 'Haute',
    assignedTo: 42,
    project: { id: 10 },
    status: 'en cours',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.setItem('userId', '42'); // Simule un user connecté
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('devrait récupérer les tâches par projet', () => {
    const projectId = 10;

    service.getTasksByProject(projectId).subscribe((tasks) => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].name).toBe('Tâche Test');
    });

    const req = httpMock.expectOne(`http://localhost:8080/api/tasks/project/${projectId}`);
    expect(req.request.method).toBe('GET');
    req.flush([mockTask]);
  });

  it('devrait créer une nouvelle tâche', () => {
    service.createTask(mockTask).subscribe((task) => {
      expect(task).toEqual(mockTask);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockTask);
    req.flush(mockTask);
  });

  it('devrait mettre à jour une tâche existante', () => {
    const updatedTask: Task = { ...mockTask, name: 'Nouveau nom' };

    service.updateTask(updatedTask).subscribe((task) => {
      expect(task.name).toBe('Nouveau nom');
    });

    const req = httpMock.expectOne(`http://localhost:8080/api/tasks/${updatedTask.id}?userId=42`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedTask);
    req.flush(updatedTask);
  });

  it('devrait lever une erreur si updateTask est appelé sans id', () => {
    const taskSansId: Task = {
      ...mockTask,
      id: undefined,
      name: 'Sans ID',
    };

    expect(() => service.updateTask(taskSansId)).toThrowError('Task id is required for update');
  });
});
