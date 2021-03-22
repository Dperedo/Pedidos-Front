import { ClienteModel } from './cliente.model';
import { EstadoModel } from './estado.model';
import { DetallePedidoModel } from './detallePedido.model';
export class PedidoModel {
    id: string;
    secuencial: number;
    cliente: ClienteModel;
    estado: EstadoModel;
    total: number;
    detallePedidos: DetallePedidoModel[];
    fechaDeCreacion: string;
    observaciones: string;
}