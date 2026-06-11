export class CreateActivityRequest {
  id?: number
  title?: string
  dueDate?: string
  completed?: boolean

  constructor({ id, title, dueDate, completed }: { id?: number; title?: string; dueDate?: string; completed?: boolean } = {}) {
    this.id = id
    this.title = title
    this.dueDate = dueDate
    this.completed = completed
  }
}
