export type NoteStatus = 'urgent' | 'serious' | 'unimportant';

export type Note = {
  id: number;
  title: string;
  status: NoteStatus;
};

export type NoteWithNbTasks = Note & { nbTasks: number };
export type NoteWithTasks = Note & { tasks: Task[] };

export type Task = {
  id: number;
  content: string;
};
