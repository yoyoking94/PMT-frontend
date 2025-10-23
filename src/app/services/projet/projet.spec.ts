import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { MembreProjet, MembreProjetService } from '../membre/membre';

describe('MembreProjetService', () => {
  let service: MembreProjetService;
  let httpMock: HttpTestingController;

  const dummyMembre: MembreProjet = {
    id: 1,
    projetId: 1,
    utilisateurId: 2,
    role: 'membre',
    email: 'user@example.com'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MembreProjetService]
    });

    service = TestBed.inject(MembreProjetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve members for a project', () => {
    service.getMembresByProjet(1).subscribe(membres => {
      expect(membres.length).toBe(1);
      expect(membres[0].role).toBe('membre');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/membres/projet/1');
    expect(req.request.method).toBe('GET');
    req.flush([dummyMembre]);
  });

  it('should add member by email', () => {
    service.addMembreByEmail(1, 'user@example.com', 'membre', 10).subscribe(membre => {
      expect(membre.id).toBe(1);
    });

    const req = httpMock.expectOne((request) =>
      request.url === 'http://localhost:8080/api/membres/add' &&
      request.params.get('projetId') === '1' &&
      request.params.get('email') === 'user@example.com' &&
      request.params.get('role') === 'membre' &&
      request.params.get('userId') === '10'
    );
    expect(req.request.method).toBe('POST');
    req.flush(dummyMembre);
  });

  it('should delete member', () => {
    service.removeMembre(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/membres/delete/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
