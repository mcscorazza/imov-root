// src/utils/math.ts
import type { GeoPoint } from "../services/api";

export function calcularDistanciaHaversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calcularVelocidadesSuavizadas(
  pontosDeGPS: GeoPoint[],
): number[] {
  if (!pontosDeGPS || pontosDeGPS.length < 2) return [];

  const velocidadesBrutas: number[] = [0];
  for (let i = 1; i < pontosDeGPS.length; i++) {
    const pAtual = pontosDeGPS[i];
    const pAnt = pontosDeGPS[i - 1];
    const distKm = calcularDistanciaHaversine(
      pAnt.lat,
      pAnt.lng,
      pAtual.lat,
      pAtual.lng,
    );
    const tempoSegundos = pAtual.t - pAnt.t;

    if (tempoSegundos > 0) {
      const velKmH = distKm / (tempoSegundos / 3600);
      velocidadesBrutas.push(Math.min(velKmH, 120));
    } else {
      velocidadesBrutas.push(velocidadesBrutas[i - 1]);
    }
  }

  const windowSize = 10;
  const halfWindow = Math.floor(windowSize / 2);
  const velocidadesSuavizadas: number[] = [];

  for (let i = 0; i < velocidadesBrutas.length; i++) {
    let soma = 0;
    let contagem = 0;
    for (
      let j = Math.max(0, i - halfWindow);
      j <= Math.min(velocidadesBrutas.length - 1, i + halfWindow);
      j++
    ) {
      soma += velocidadesBrutas[j];
      contagem++;
    }
    velocidadesSuavizadas.push(soma / contagem);
  }
  return velocidadesSuavizadas;
}

export function buscarCoordenadaPorTempo(
  coordenadasDaViagem: GeoPoint[],
  tempoAlvo: number,
): GeoPoint | null {
  if (!coordenadasDaViagem || coordenadasDaViagem.length === 0) return null;
  let inicio = 0;
  let fim = coordenadasDaViagem.length - 1;
  let melhorOpcao = coordenadasDaViagem[0];

  while (inicio <= fim) {
    const meio = Math.floor((inicio + fim) / 2);
    const pontoMeio = coordenadasDaViagem[meio];

    if (
      Math.abs(pontoMeio.t - tempoAlvo) < Math.abs(melhorOpcao.t - tempoAlvo)
    ) {
      melhorOpcao = pontoMeio;
    }

    if (pontoMeio.t < tempoAlvo) inicio = meio + 1;
    else if (pontoMeio.t > tempoAlvo) fim = meio - 1;
    else return pontoMeio;
  }
  return melhorOpcao;
}
