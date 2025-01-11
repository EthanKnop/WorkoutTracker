export class Machine {
    id: number = 0;
    name: string = '';
    data: Array<{weight: number, date: string}> = [];
    type: string = '';

    constructor(id: number, name: string, data: Array<{weight: number, date: string}>, type: string) {
        this.id = id;
        this.name = name;
        this.data = data;
        this.type = type;
    }
}