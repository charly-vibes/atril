export interface BusyTarget {
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

export interface LiveStatusTarget {
  textContent: string | null;
}

export function beginAsyncUpdate(
  region: BusyTarget,
  status: LiveStatusTarget,
  message: string,
) {
  region.setAttribute("aria-busy", "true");
  status.textContent = message;
}

export function endAsyncUpdate(
  region: BusyTarget,
  status: LiveStatusTarget,
  message?: string,
) {
  region.removeAttribute("aria-busy");
  status.textContent = message ?? "";
}
