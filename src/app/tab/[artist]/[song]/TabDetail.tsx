"use client";

/**
 * Re-export tipado explicitamente.
 *
 * Antes era `export { default } from "@/lib/TabDetailComponent"`, que congela a
 * assinatura das props: o build recusava a prop nova `initialTab` mesmo ela
 * existindo no componente. Declarar os tipos aqui resolve.
 */
import TabDetailComponent from "@/lib/TabDetailComponent";

export default function TabDetail(props: {
  params: { artist: string; song: string };
  initialTab?: any | null;
}) {
  return <TabDetailComponent {...props} />;
}
