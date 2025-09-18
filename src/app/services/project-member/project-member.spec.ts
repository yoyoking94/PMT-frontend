import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProjectMemberService } from './project-member';

describe('ProjectMemberService', () => {
  let service: ProjectMemberService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectMemberService],
    });
    service = TestBed.inject(ProjectMemberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
