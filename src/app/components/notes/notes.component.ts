import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Note } from '../../models/note.model';
import { NotesService } from '../../services/notes.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})

export class NotesComponent implements OnInit, OnDestroy {
    public notes: Note[] = [];
    public newNoteTitle: string = '';
    public newNoteContent: string = '';
    public isCreating: boolean = false;
    public errorMessage: string = '';
    public isLoading: boolean = false;

    private notesSubscription?: Subscription;

    constructor(private notesService: NotesService) {}

    ngOnInit(): void { this.loadNotes(); }

    ngOnDestroy(): void {
        if (this.notesSubscription) {
            this.notesSubscription.unsubscribe();
        }
    }

    // mount data
    public loadNotes(): void {
        this.notesSubscription = this.notesService.getNotes().subscribe(
            (notes: Note[]) => {
                this.notes = notes;
            }
        );
    }

    public toggleCreateForm(): void {
        this.isCreating = !this.isCreating;
        if (!this.isCreating) {
            this.resetCreateForm();
        }
    }

    public createNote(): void {
        if (!this.isFormValid()) return;

        this.clearErrorMessage();
        
        this.notesService.createNote(
            this.newNoteTitle, 
            this.newNoteContent).subscribe({
                next: () => {
                    this.resetCreateForm();
                    this.isCreating = false;
                },
                error: (error) => {
                    this.errorMessage = error.message || 'Failed to create note';
                }
            });
    }

    public deleteNote(id: number): void {
        console.log("delete id", id)
        if (!confirm('Are you sure you want to delete this note?')) return;

        this.clearErrorMessage();
        
        this.notesService.deleteNote(id).subscribe({
            error: (error) => {
                this.errorMessage = error.message || 'Failed to delete note';
            }
        });
    }

    public refreshNotes(): void {
        this.clearErrorMessage();
        this.notesService.loadNotesFromAPI().subscribe({
            error: (error) => {
            this.errorMessage = 'Failed to refresh notes from server';
            }
        });
    }


    public getTotalNotes(): number {
        return this.notesService.getNotesCount();
    }

    // validator
    public isFormValid(): boolean {
        return this.newNoteTitle.trim().length > 0 && this.newNoteContent.trim().length > 0;
    }
    
    private resetCreateForm(): void {
        this.newNoteTitle = '';
        this.newNoteContent = '';
        this.clearErrorMessage();
    }

    private clearErrorMessage(): void {
        this.errorMessage = '';
    }
}