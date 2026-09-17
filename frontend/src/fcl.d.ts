declare module '@onflow/fcl' {
  interface FclConfig {
    (values: Record<string, string>): FclConfig;
  }

  interface FclQueryOptions {
    cadence: string;
  }

  const config: FclConfig;
  function query<T = Record<string, unknown>>(options: FclQueryOptions): Promise<T | null>;

  export { config, query };
}
