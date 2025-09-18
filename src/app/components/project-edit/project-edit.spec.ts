import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProjectEditComponent } from './project-edit';
import { ProjectService } from '../../services/project/project';
import { ProjectMemberService } from '../../services/project-member/project-member';
import { Task, TaskService } from '../../services/task/task';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('ProjectEditComponent', () => {
  let component: ProjectEditComponent;
  let fixture: ComponentFixture<ProjectEditComponent>;

  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let memberServiceSpy: jasmine.SpyObj<ProjectMemberService>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const fakeProject = {
    id: 1,
    name: 'Projet Test',
    description: 'Description test',
    startDate: '2025-01-01',
    createBy: 1,
  };

  const fakeMembers = [
    { id: 1, user: { id: 1, username: 'user1' }, role: 'ADMIN' },
    { id: 2, user: { id: 2, username: 'user2' }, role: 'MEMBER' },
  ];

  const fakeTask: Task = {
    id: 1,
    name: 'Tache 1',
    dueDate: '2025-01-10',
    priority: 'Moyenne', // Respecte bien 'Basse'|'Moyenne'|'Haute'
    project: { id: 1 },
    status: 'etudes',
  };
  const fakeTasks = [fakeTask];

  beforeEach(waitForAsync(() => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', [
      'getProjects',
      'updateProject',
      'deleteProject',
    ]);
    memberServiceSpy = jasmine.createSpyObj('ProjectMemberService', [
      'getProjectMembers',
      'checkIfUserIsMember',
      'inviteMember',
      'deleteMember',
    ]);
    taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'getTasksByProject',
      'createTask',
      'updateTask',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Simuler ActivatedRoute avec un paramètre d'ID projet
    const activatedRouteStub = {
      snapshot: { paramMap: new Map([['id', '1']]) },
    };

    TestBed.configureTestingModule({
      imports: [ProjectEditComponent],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: ProjectMemberService, useValue: memberServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectEditComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load project, members and tasks on init', () => {
    spyOn(localStorage, 'getItem').and.returnValue('1'); // currentUserId = 1

    projectServiceSpy.getProjects.and.returnValue(of([fakeProject]));
    memberServiceSpy.getProjectMembers.and.returnValue(of(fakeMembers));
    taskServiceSpy.getTasksByProject.and.returnValue(of(fakeTasks));

    fixture.detectChanges(); // trigger ngOnInit()

    expect(projectServiceSpy.getProjects).toHaveBeenCalled();
    expect(memberServiceSpy.getProjectMembers).toHaveBeenCalled();
    expect(taskServiceSpy.getTasksByProject).toHaveBeenCalled();

    expect(component.editProject.id).toBe(1);
    expect(component.members.length).toBe(2);
    expect(component.tasks.length).toBe(1);
  });

  it('should handle addTask with valid data', () => {
    taskServiceSpy.createTask.and.returnValue(of(fakeTasks[0]));
    taskServiceSpy.getTasksByProject.and.returnValue(of(fakeTasks));

    component.editProject.id = 1;
    component.newTask = {
      name: 'New task',
      dueDate: '2025-02-01',
      project: { id: 1 },
      priority: 'Moyenne',
      status: 'etudes',
    };

    spyOn(window, 'alert');

    component.addTask();

    expect(taskServiceSpy.createTask).toHaveBeenCalled();
    expect(component.newTask.name).toBe('');
  });

  it('should show alert if addTask called with invalid data', () => {
    spyOn(window, 'alert');
    component.newTask = { name: '', dueDate: '', project: { id: 1 } };

    component.addTask();

    expect(window.alert).toHaveBeenCalledWith('Le nom et la date de début sont obligatoires.');
  });

  it('should delete member and reload members', () => {
    memberServiceSpy.deleteMember.and.returnValue(of({}));
    memberServiceSpy.getProjectMembers.and.returnValue(of(fakeMembers));
    component.editProject.id = 1;

    component.removeMember(2);

    expect(memberServiceSpy.deleteMember).toHaveBeenCalledWith(1, 2, component.currentUserId);
  });

  it('should handle inviteMember with valid email', () => {
    memberServiceSpy.inviteMember.and.returnValue(of({}));
    memberServiceSpy.getProjectMembers.and.returnValue(of(fakeMembers));
    component.editProject.id = 1;
    component.inviteEmail = 'invite@example.com';
    component.inviteRole = 'MEMBER';

    component.inviteMember();

    expect(memberServiceSpy.inviteMember).toHaveBeenCalledWith(
      1,
      'invite@example.com',
      'MEMBER',
      component.currentUserId
    );
    expect(component.inviteEmail).toBe('');
  });

  it('should handle inviteMember with empty email', () => {
    component.inviteEmail = '';
    component.inviteMember();

    expect(component.inviteErrorMessage).toBe('Veuillez saisir un email');
  });

  it('should navigate to dashboard on saveEdit success', () => {
    projectServiceSpy.updateProject.and.returnValue(
      of({
        id: 1,
        name: 'Projet test',
        startDate: '2025-01-01',
        createBy: 1,
        description: 'Description de test',
      })
    );
    component.editProject.id = 1;

    component.saveEdit();

    expect(projectServiceSpy.updateProject).toHaveBeenCalledWith(1, component.editProject);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate to dashboard on deleteProject success', () => {
    projectServiceSpy.deleteProject.and.returnValue(of({}));
    component.editProject.id = 1;

    component.deleteProject();

    expect(projectServiceSpy.deleteProject).toHaveBeenCalledWith(1, component.currentUserId);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('canModifyProject should return true if user is creator', () => {
    component.editProject.createBy = 1;
    component.currentUserId = 1;
    expect(component.canModifyProject()).toBeTrue();
  });

  it('canModifyProject should return true if user is ADMIN member', () => {
    component.currentUserId = 2;
    component.members = [{ user: { id: 2 }, role: 'ADMIN' }];
    expect(component.canModifyProject()).toBeTrue();
  });

  it('canModifyProject should return false otherwise', () => {
    component.currentUserId = 3;
    component.members = [{ user: { id: 2 }, role: 'MEMBER' }];
    expect(component.canModifyProject()).toBeFalse();
  });
});
