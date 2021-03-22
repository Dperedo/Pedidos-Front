import { ProductoModel } from './producto.model';
export class DetallePedidoModel {
    id: string;
    producto: ProductoModel;
    cantidad: number;
    fechaDeCreacion: Date;
}