import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { crearCarrito } from '@/services/carrito.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tipoPedido, carritoData } = body;

    const resultado = await crearCarrito(tipoPedido, carritoData);

    if (!resultado.success) {
      return NextResponse.json(
        { error: resultado.error },
        { status: 400 },
      );
    }

    // Revalidar el dashboard para que se actualicen los estados de las mesas
    revalidatePath('/dashboard');
    revalidatePath('/[locale]/dashboard', 'page');

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error in POST /api/carrito/crear:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
