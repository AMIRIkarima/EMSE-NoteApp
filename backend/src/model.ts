export type NoteStatus = 'urgent' | 'serious' | 'unimportant';

export type Note = {
  id: number;
  title: string;
  status: NoteStatus;
  tasks: Array<Task>;
};

export type Task = {
  id: number;
  content: string;
};
