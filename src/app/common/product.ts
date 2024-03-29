export class Product {
    constructor(public id: string,
                public sku: string,
                public name: string,
                public description: string,
                public unitPrice: number,
                public imageUrl: string,
                public active: string,
                public unitsInStock: string,
                public dateCreated: string,
                public lastUpdated: string,
        ){

        }
}
