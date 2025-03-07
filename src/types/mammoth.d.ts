
declare module 'mammoth' {
  interface ExtractOptions {
    buffer: Buffer;
  }
  
  interface ExtractionResult {
    value: string;
    messages: any[];
  }

  function extractRawText(options: ExtractOptions): Promise<ExtractionResult>;

  export { extractRawText };
}
