import type { BeatmapsetSearchResponse } from '../types';

const BEATMAPSETS_SSR_SCRIPT_ID = '__BEATMAPSETS_SSR_DATA__';
const BEATMAPSETS_SSR_MAX_AGE = 60_000;

export interface BeatmapsetsSsrErrorPayload {
  route: {
    search: string;
  };
  error: {
    message: string;
    status?: number;
  };
}

export interface BeatmapsetsSsrSuccessPayload {
  route: {
    search: string;
  };
  response: BeatmapsetSearchResponse;
  fetchedAt: string;
}

export type BeatmapsetsSsrDocumentPayload = BeatmapsetsSsrSuccessPayload | BeatmapsetsSsrErrorPayload;

let serverBeatmapsetsSsrPayload: BeatmapsetsSsrSuccessPayload | null = null;

const escapeJsonForHtml = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

export const setServerBeatmapsetsSsrPayload = (
  payload: BeatmapsetsSsrSuccessPayload | null
): void => {
  serverBeatmapsetsSsrPayload = payload;
};

export const getBeatmapsetsSsrPayloadFromDocument = (): BeatmapsetsSsrSuccessPayload | null => {
  if (typeof document === 'undefined') return serverBeatmapsetsSsrPayload;

  const script = document.getElementById(BEATMAPSETS_SSR_SCRIPT_ID);
  if (!script?.textContent) return null;

  try {
    const payload = JSON.parse(script.textContent) as BeatmapsetsSsrDocumentPayload;
    if ('response' in payload && 'fetchedAt' in payload) {
      return payload;
    }
  } catch (error) {
    console.error('Failed to parse beatmapsets SSR payload:', error);
  }

  return null;
};

export const getBeatmapsetsSsrMaxAge = (): number => BEATMAPSETS_SSR_MAX_AGE;

export const injectBeatmapsetsSsrPayload = (
  html: string,
  payload: BeatmapsetsSsrDocumentPayload | null
): string => {
  if (!payload || !('response' in payload)) return html;

  const script = `<script id="${BEATMAPSETS_SSR_SCRIPT_ID}" type="application/json">${escapeJsonForHtml(payload)}</script>`;
  return html.replace('</body>', `${script}</body>`);
};
