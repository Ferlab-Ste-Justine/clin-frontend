import { FileResult } from 'components/screens/Patient/components/FilesTab/index'

export const sortByOldest = (columnInfoA: FileResult, columnsInfoB: FileResult): number =>{
    const dateA: Date = new Date(columnInfoA.date.replace(/-/g, '/'));
    const dateB: Date = new Date(columnsInfoB.date.replace(/-/g, '/'));
    return dateA.getTime() - dateB.getTime();
}