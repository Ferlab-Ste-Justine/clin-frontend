type Designation = {
    language: string;
    value: string;
}

export type Concept = {
    code:string;
    display: string;
    designation: Designation[];
}