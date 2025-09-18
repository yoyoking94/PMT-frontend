import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsComponent } from './project';
import { ProjectService } from '../../services/project/project';
import { ProjectMemberService } from '../../services/project-member/project-member';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let memberServiceSpy: jasmine.SpyObj<ProjectMemberService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProjects', 'createProject']);
    memberServiceSpy = jasmine.createSpyObj('ProjectMemberService', ['getProjectMembers']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: ProjectMemberService, useValue: memberServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects and members, then filter userProjects', () => {
    const mockProjects = [
      { id: 1, name: 'Project 1', startDate: '2025-01-01', createBy: 1 },
      { id: 2, name: 'Project 2', startDate: '2025-02-01', createBy: 2 },
    ];
    const mockMembers1 = [
      { role: 'ADMIN', user: { id: 1 } },
      { role: 'MEMBER', user: { id: 3 } },
    ];
    const mockMembers2 = [{ role: 'MEMBER', user: { id: 2 } }];

    projectServiceSpy.getProjects.and.returnValue(of(mockProjects));
    memberServiceSpy.getProjectMembers.withArgs(1).and.returnValue(of(mockMembers1));
    memberServiceSpy.getProjectMembers.withArgs(2).and.returnValue(of(mockMembers2));

    spyOn(localStorage, 'getItem').and.returnValue('1'); // currentUserId = 1

    fixture.detectChanges();
    component.ngOnInit();

    // We need to wait for all subscriptions to complete
    fixture.whenStable().then(() => {
      expect(component.projects.length).toBe(2);
      expect(component.membersMap[1].length).toBe(2);
      expect(component.membersMap[2].length).toBe(1);
      expect(component.userProjects.length).toBe(1); // user id 1 is member/admin or creator only of project 1
    });
  });

  it('should add a project and reload projects', () => {
    component.currentUserId = 1;
    component.newProject = { name: 'New Project', startDate: '2025-03-01', description: 'Desc' };

    projectServiceSpy.createProject.and.returnValue(
      of({
        id: 3,
        name: component.newProject.name!,
        startDate: component.newProject.startDate!,
        description: component.newProject.description,
        createBy: 1,
      })
    );
    spyOn(component, 'loadProjects');

    component.addProject();

    expect(projectServiceSpy.createProject).toHaveBeenCalled();
    expect(component.loadProjects).toHaveBeenCalled();
    expect(component.newProject.name).toBe('');
  });

  it('should not add project if missing name or date', () => {
    component.newProject = { name: '', startDate: '' };
    spyOn(window, 'alert');

    component.addProject();

    expect(window.alert).toHaveBeenCalledWith('Veuillez remplir nom et date');
  });
});
