import { redirect } from 'next/navigation';

/** La raíz privada no tiene contenido propio: el producto arranca en el radar. */
export default function HomePage() {
  redirect('/radar');
}
