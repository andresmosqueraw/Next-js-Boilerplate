export type Mesa = {
  id: number;
  restaurante_id: number;
  numero_mesa: number;
  capacidad: number | null;
  estado: string;
  creado_en: string;
};

export type Domicilio = {
  id: number;
  cliente_id: number;
  direccion: string;
  ciudad: string | null;
  referencia: string | null;
  creado_en: string;
};

export type Cliente = {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  creado_en: string;
};

export type Restaurante = {
  id: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  creado_en: string;
};

export type TipoPedido = {
  id: number;
  mesa_id: number | null;
  domicilio_id: number | null;
};

export type Carrito = {
  id: number;
  restaurante_id: number;
  tipo_pedido_id: number;
  cliente_id: number | null;
  estado: string;
  creado_en: string;
};

export type CarritoProducto = {
  id: number;
  carrito_id: number;
  producto_restaurante_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

export type Producto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  creado_en: string;
};

export type ProductoRestaurante = {
  id: number;
  restaurante_id: number;
  producto_id: number;
  disponible: boolean;
};

export type TipoPedidoEnum = 'MESA' | 'DOMICILIO';

export type Venta = {
  id: number;
  carrito_id: number;
  restaurante_id: number;
  total: number;
  dinero_recibido: number;
  cambio_dado: number;
  tipo_de_pedido: TipoPedidoEnum;
  metodo_pago: string | null;
  fecha: string;
};

export type Usuario = {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
  rol: string;
  activo: boolean;
  creado_en: string;
};

export type UsuarioRestaurante = {
  usuario_id: number;
  restaurante_id: number;
  rol_local: string | null;
  activo: boolean;
};
