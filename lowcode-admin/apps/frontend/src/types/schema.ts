export type WidgetType = 'Input' | 'Select' | 'DatePicker' | 'Switch' | string

export interface SearchFieldSchema {
  field: string
  label: string
  widget: WidgetType
  perm?: string
  props?: Record<string, any>
}

export interface TableColumnSchema {
  field: string
  label: string
  width?: number | string
  mask?: 'phone' | 'id' | 'email' | string
}

export interface TableSchema {
  columns: TableColumnSchema[]
  rowActions?: Array<{ type: 'edit'|'delete'|string; label: string; perm?: string }>
  import?: boolean
  export?: boolean
}

export interface FormFieldSchema {
  field: string
  label: string
  widget: WidgetType
  rules?: Array<Record<string, any>>
  options?: Array<{ label: string; value: any }>
  perm?: string
}

export interface FormSchema {
  fields: FormFieldSchema[]
  submitPerm?: string
}

export interface ApiSchema {
  list: string
  create?: string
  update?: string
  delete?: string
  import?: string
  export?: string
  template?: string
}

export interface PageSchema {
  title: string
  route: string
  api: ApiSchema
  search?: SearchFieldSchema[]
  table: TableSchema
  form?: FormSchema
  rowFilter?: string
  workflow?: string
  mock?: boolean
  cache?: number
}