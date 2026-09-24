15:15:07.094 Running build in Washington, D.C., USA (East) – iad1
15:15:07.096 Build machine configuration: 2 cores, 8 GB
15:15:07.333 Cloning github.com/Chordproof/Chordproof (Branch: main, Commit: 4bd9393)
15:15:11.341 Cloning completed: 4.008s
15:15:11.575 Restored build cache from previous deployment (7WZvMSrdmUgPa55ENrq2CMgKwwy1)
15:15:12.572 Running "vercel build"
15:15:12.609 Vercel CLI 59.25.4
15:15:13.644 WARNING: You should not upload the `.next` directory.
15:15:13.650 Installing dependencies...
15:15:15.183 
15:15:15.184 up to date in 1s
15:15:15.185 
15:15:15.185 30 packages are looking for funding
15:15:15.186   run `npm fund` for details
15:15:15.369 Detected Next.js version: 14.2.5
15:15:15.377 Running "npm run build"
15:15:15.859 
15:15:15.866 > chordproof@1.0.0 build
15:15:15.867 > next build
15:15:15.867 
15:15:17.026   ▲ Next.js 14.2.5
15:15:17.027   - Environments: .env.local
15:15:17.027 
15:15:17.067    Creating an optimized production build ...
15:15:31.549 Failed to compile.
15:15:31.552 
15:15:31.552 ./src/lib/tabRenderer.tsx
15:15:31.552 Error: 
15:15:31.553   x 'import', and 'export' cannot be used outside of module code
15:15:31.553      ,-[/vercel/path0/src/lib/tabRenderer.tsx:300:1]
15:15:31.553  300 |  * TabDetailComponent. Os args extras são ignorados (defensivo
15:15:31.553  301 |  * contra diferenças de assinatura entre chamadas).
15:15:31.555  302 |  * ============================================================ */
15:15:31.555  303 | export function renderTablature(content: string, ..._extra: unknown[]): ReactNode[] {
15:15:31.555      : ^^^^^^
15:15:31.555  304 |   const themeLocal = { ...DEFAULT_THEME } as Required<TabTheme>;
15:15:31.555  305 |   const lines = content.split("\n");
15:15:31.556  306 |   const out: ReactNode[] = [];
15:15:31.556      `----
15:15:31.556 
15:15:31.556 Caused by:
15:15:31.557     Syntax Error
15:15:31.557 
15:15:31.557 Import trace for requested module:
15:15:31.558 ./src/lib/tabRenderer.tsx
15:15:31.558 ./src/lib/TabDetailComponent.tsx
15:15:31.558 
15:15:31.585 
15:15:31.586 > Build failed because of webpack errors
15:15:31.659 Error: Command "npm run build" exited with 1
