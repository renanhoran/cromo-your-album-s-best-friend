import { useCallback, useState } from "react";
import { toast } from "sonner";

export interface GeoResult {
  lat: number;
  lng: number;
  cidade?: string;
  estado?: string;
}

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<GeoResult | null>(null);

  const request = useCallback(async (): Promise<GeoResult | null> => {
    if (!("geolocation" in navigator)) {
      toast.error("Seu navegador não suporta geolocalização");
      return null;
    }
    setLoading(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          let cidade: string | undefined;
          let estado: string | undefined;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`
            );
            const data = await res.json();
            const a = data?.address ?? {};
            cidade = a.city || a.town || a.village || a.municipality || a.county;
            estado = a.state;
          } catch {
            // ignore reverse-geocoding errors
          }
          const result = { lat: latitude, lng: longitude, cidade, estado };
          setCoords(result);
          setLoading(false);
          resolve(result);
        },
        (err) => {
          setLoading(false);
          if (err.code === err.PERMISSION_DENIED) {
            toast.error("Permissão de localização negada");
          } else {
            toast.error("Não foi possível obter sua localização");
          }
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  return { loading, coords, request };
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function normalizeCidade(c?: string | null): string {
  if (!c) return "";
  return c
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(",")[0]
    .trim();
}