import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MembreProjet, MembreProjetService } from '../../services/membre/membre';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-membre',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './membre.html',
  styleUrls: ['./membre.css'],
})
export class MembreComponent implements OnInit {
  @Input() projetId!: number;
  @Output() membresChanged = new EventEmitter<void>();

  membres: MembreProjet[] = [];
  addForm!: FormGroup;
  isAdmin = false;

  constructor(
    private membreService: MembreProjetService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.addForm = this.fb.group({
      email: [''],
      role: ['membre'],
    });
    this.loadMembres();
  }

  loadMembres(): void {
    this.membreService.getMembresByProjet(this.projetId).subscribe((membres) => {
      this.membres = membres;
      const currentUserId = this.authService.getCurrentUserId();
      this.isAdmin = membres.some(
        (member) =>
          member.utilisateurId === currentUserId && member.role.toLowerCase() === 'administrateur'
      );
      membres.forEach((membre, index) => {
        this.authService.getUserById(membre.utilisateurId).subscribe((user) => {
          this.membres[index].email = user.email;
        });
      });
    });
  }

  addMembre(): void {
    if (this.addForm.valid && this.isAdmin) {
      const { email, role } = this.addForm.value;
      const userId = this.authService.getCurrentUserId();
      this.membreService.addMembreByEmail(this.projetId, email, role, userId!).subscribe(
        () => {
          this.loadMembres();
          this.membresChanged.emit(); // Notifie le parent du changement
          this.addForm.reset({ role: 'membre' });
        },
        () => alert("Erreur lors de l'ajout")
      );
    }
  }

  deleteMembre(membreId: number): void {
    this.membreService.removeMembre(membreId).subscribe(() => {
      this.loadMembres();
      this.membresChanged.emit(); // Notifie le parent aussi à la suppression
    });
  }
}
