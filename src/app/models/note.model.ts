export class Note {
    private static idCounter = 1;

    public readonly id: number;
    public title: string;
    public content: string;
    public readonly createdAt: Date;

    constructor(id: number, title: string, content: string, createdAt: Date) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
    }

    public getFormattedDate(): string {
        return this.createdAt.toLocaleString();
    }
}
