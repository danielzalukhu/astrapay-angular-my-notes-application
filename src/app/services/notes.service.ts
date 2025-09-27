import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Note } from "../models/note.model";
import { BehaviorSubject, catchError, Observable, tap, throwError, timeout } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})

export class NotesService {

    private readonly API_URL = environment.apiUrl;
    private readonly ENDPOINTS = {
        NOTES: `${this.API_URL}/api/notes`,
        NOTE: (id: number) => `${this.API_URL}/api/notes/${id}`,
    };

    private notes: Note[] = [];
    private notesSubject = new BehaviorSubject<Note[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);


    constructor(private _http: HttpClient) {
        this.loadNotesFromAPI().subscribe({
            next: () => this.log('Notes loaded successfully'),
            error: (error) => this.log('Failed to load notes, using fallback data', error)
        });
    }

    private log(message: string, data?: any): void {
        if (environment.enableLogging) {
            console.log(`[note-service] ${message}`, data || '');
        }
    }

    private setLoading(loading: boolean): void {
        this.loadingSubject.next(loading);
    }


    private updateNotesSubject(): void {
        this.notesSubject.next([...this.notes]);
    }

    public loadNotesFromAPI(): Observable<Note[]> {
        this.setLoading(true);
        return this._http.get<any[]>(this.ENDPOINTS.NOTES).pipe(
            timeout(environment.apiTimeout),
            tap((apiNotes) => {
                this.notes = apiNotes.map(apiNote => this.convertResponseToNote(apiNote));
                this.updateNotesSubject();
                this.setLoading(false);
                this.log('Loaded notes from API:', apiNotes);
            }),
            catchError((error) => {
                this.setLoading(false);
                this.log('Failed to load notes from API', error);
                return throwError(() => error);
            })
        );
    }

    private convertResponseToNote(apiNote: any): Note {
        this.log("start convert respone", apiNote)
        const note = new Note(apiNote.id, apiNote.title, apiNote.content, apiNote.createdAt);
        this.log("end convert response", note)
        return note;
    }

    public getNotes(): Observable<Note[]> {
        return this.notesSubject.asObservable();
    }

    public getAllNotes(): Note[] {
        return [...this.notes];
    }

    public createNote(title: string, content: string): Observable<Note> {
        if (!title.trim() && !content.trim()) {
            throw new Error("Title and content cannot both be empty.");
        }

        const payload = {
            title: title.trim(),
            content: content.trim(),
        }

        this.setLoading(true);
        this.log("add note payload", payload)
        return this._http.post<any>(this.ENDPOINTS.NOTES, payload).pipe(
            timeout(environment.apiTimeout),
            tap((apiNote) => {
                const newNote = this.convertResponseToNote(apiNote);
                this.log('new note', newNote);
                this.notes.unshift(newNote);
                this.updateNotesSubject();
                this.setLoading(false);
            }),
            catchError((error) => {
                this.setLoading(false);
                this.log('Failed to create note', error);
                throw new Error('Failed to create note');
            })
        );
    }

    public deleteNote(id: number): Observable<boolean> {
        this.setLoading(true);

        return this._http.delete<any>(this.ENDPOINTS.NOTE(id)).pipe(
            tap(() => {
                const indexLength = this.notes.length;

                this.notes = this.notes.filter(note => note.id !== id);

                if (this.notes.length < indexLength) {
                    this.log("Delete note with id:", id);
                    this.updateNotesSubject();
                    return true;
                }
                this.setLoading(false);
                return false;
            }),
            catchError((error) => {
                this.setLoading(false);
                this.log('Failed to delete note', error);
                throw new Error('Failed to delete note');
            })
        );
    }

    public getNotesCount(): number {
        return this.notes.length;
    }
}
