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
